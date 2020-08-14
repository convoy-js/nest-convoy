import { Message } from '@nest-convoy/messaging/common';
import {
  RuntimeException,
  UnsupportedOperationException,
} from '@nest-convoy/common';

import { SagaActions, SagaActionsBuilder } from '../saga-actions';
import { SagaDefinition } from '../saga-definition';

import { SagaStep, SagaStepReplyHandler } from './saga-step';
import { SagaExecutionState } from './saga-execution-state';
import { StepToExecute } from './step-to-execute';
import { NestSaga } from './nest-saga';
import {
  decodeExecutionState,
  encodeExecutionState,
} from './saga-execution-state-json-serde';

export class NestSagaDefinition<Data> implements SagaDefinition<Data> {
  constructor(
    private readonly sagaSteps: SagaStep<Data>[],
    private readonly saga: NestSaga<Data>,
  ) {}

  private async nextStepToExecute(
    { compensating, currentlyExecuting }: SagaExecutionState,
    data: Data,
  ): Promise<StepToExecute<Data>> {
    const direction = compensating ? -1 : +1;
    let skipped = 0;

    for (
      let i = currentlyExecuting + direction;
      i >= 0 && i < this.sagaSteps.length;
      i = i + direction
    ) {
      const step = this.sagaSteps[i];
      if (
        compensating
          ? await step.hasCompensation(data)
          : await step.hasAction(data)
      ) {
        return new StepToExecute<Data>(skipped, compensating, step);
      } else {
        skipped++;
      }
    }

    return new StepToExecute<Data>(skipped, compensating);
  }

  private async executeNextStep(
    sagaData: Data,
    currentState: SagaExecutionState,
  ): Promise<SagaActions<Data>> {
    const stepToExecute = await this.nextStepToExecute(currentState, sagaData);

    return stepToExecute.isEmpty()
      ? this.makeEndStateSagaActions(currentState)
      : stepToExecute.executeStep(sagaData, currentState);
  }

  private makeEndStateSagaActions(
    currentState: SagaExecutionState,
  ): SagaActions<Data> {
    return new SagaActionsBuilder<Data>()
      .withUpdatedState(encodeExecutionState(SagaExecutionState.makeEndState()))
      .withIsEndState(true)
      .withIsCompensating(currentState.compensating)
      .build();
  }

  private async invokeReplyHandler(
    message: Message,
    data: Data,
    handleReply: SagaStepReplyHandler<Data>,
  ): Promise<void> {
    // TODO - eventuate-tram-sagas-orchestration-simple-dsl/src/main/java/io/eventuate/tram/sagas/simpledsl/SimpleSagaDefinition.java
    // const replyType = message.getRequiredHeader(ReplyMessageHeaders.REPLY_TYPE);
    await handleReply(data, message.parsePayload());
  }

  start(sagaData: Data): Promise<SagaActions<Data>> {
    const currentState = new SagaExecutionState();
    return this.executeNextStep(sagaData, currentState);
  }

  async handleReply(
    currentState: string,
    sagaData: Data,
    message: Message,
  ): Promise<SagaActions<Data>> {
    const state = decodeExecutionState(currentState);
    const currentStep = this.sagaSteps[state.currentlyExecuting];
    if (!currentStep) {
      throw new RuntimeException();
    }

    const replyHandler = currentStep.getReplyHandler(
      message,
      state.compensating,
    );
    if (replyHandler) {
      await this.invokeReplyHandler(message, sagaData, replyHandler);
    }

    if (currentStep.isSuccessfulReply(state.compensating, message)) {
      return this.executeNextStep(sagaData, state);
    } else if (state.compensating) {
      throw new UnsupportedOperationException('Failure when compensating');
    } else {
      return this.executeNextStep(sagaData, state.startCompensating());
    }
  }
}
