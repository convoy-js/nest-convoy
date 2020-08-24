import { Message } from '@nest-convoy/messaging/common';
import {
  Type,
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
    state: SagaExecutionState,
  ): SagaActions<Data> {
    return new SagaActionsBuilder<Data>()
      .withUpdatedState(encodeExecutionState(SagaExecutionState.makeEndState()))
      .withIsEndState(true)
      .withIsCompensating(state.compensating)
      .build();
  }

  private async invokeReplyHandler(
    message: Message,
    data: Data,
    replyType: Type<any>,
    handleReply: SagaStepReplyHandler<Data>,
  ): Promise<void> {
    const reply = Object.assign(new replyType(), message.parsePayload());
    await handleReply(data, reply);
  }

  async start(sagaData: Data): Promise<SagaActions<Data>> {
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
      throw new RuntimeException(
        `Saga step is missing for execution state ${currentState}`,
      );
    }

    const reply = currentStep.getReply(message, state.compensating);
    if (reply) {
      await this.invokeReplyHandler(
        message,
        sagaData,
        reply.type,
        reply.handler,
      );
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
