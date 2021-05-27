import type { Type } from '@nest-convoy/common';
import {
  RuntimeException,
  UnsupportedOperationException,
} from '@nest-convoy/common';
import type { Message } from '@nest-convoy/messaging/common';

import type { SagaActions } from '../saga-actions';
import { SagaActionsBuilder } from '../saga-actions';
import type { SagaDefinition } from '../saga-definition';
import { SagaExecutionState } from '../saga-execution-state';
import type { SagaStep, SagaStepReplyHandler } from './saga-step';
import { StepToExecute } from './step-to-execute';

export class NestSagaDefinition<Data> implements SagaDefinition<Data> {
  constructor(private readonly sagaSteps: SagaStep<Data>[]) {}

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
      .withUpdatedState(SagaExecutionState.makeEndState())
      .withIsEndState(true)
      .withIsCompensating(state.compensating)
      .build();
  }

  private async invokeReplyHandler(
    message: Message,
    data: Data,
    replyType: Type,
    handleReply: SagaStepReplyHandler<Data>,
  ): Promise<void> {
    const reply = await message.parsePayload(replyType);
    await handleReply(data, reply);
  }

  async start(sagaData: Data): Promise<SagaActions<Data>> {
    const currentState = new SagaExecutionState();
    return this.executeNextStep(sagaData, currentState);
  }

  async handleReply(
    currentState: SagaExecutionState,
    sagaData: Data,
    message: Message,
  ): Promise<SagaActions<Data>> {
    const currentStep = this.sagaSteps[currentState.currentlyExecuting];
    if (!currentStep) {
      throw new RuntimeException(
        `Saga step is missing for execution state ${currentState}`,
      );
    }

    const reply = currentStep.getReply(message, currentState.compensating);
    if (reply) {
      await this.invokeReplyHandler(
        message,
        sagaData,
        reply.type,
        reply.handler,
      );
    }

    if (currentStep.isSuccessfulReply(currentState.compensating, message)) {
      return this.executeNextStep(sagaData, currentState);
    } else if (currentState.compensating) {
      throw new UnsupportedOperationException('Failure when compensating');
    } else {
      return this.executeNextStep(sagaData, currentState.startCompensating());
    }
  }
}
