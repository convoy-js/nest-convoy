import { Command, CommandProvider } from '@nest-convoy/commands/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Builder, Predicate } from '@nest-convoy/core';
import { Type } from '@nestjs/common';

import { SagaDefinition } from '../saga-definition';
import { SimpleSagaDefinitionBuilder } from './simple-saga-definition-builder';
import { BaseStepBuilder, StepBuilder } from './step-builder';
import { SagaStepReplyHandler } from './saga-step';
import { CommandEndpoint } from './command-endpoint';
import {
  BaseParticipantInvocation,
  ParticipantEndpointInvocation,
  ParticipantInvocation,
} from './participant-invocation';
import {
  ParticipantInvocationStep,
  ReplyHandlers,
} from './participant-invocation-step';
import {
  Compensation,
  WithActionBuilder,
  WithCompensationBuilder,
} from './with-builder';

export class InvokeParticipantStepBuilder<Data>
  implements
    BaseStepBuilder<Data>,
    WithCompensationBuilder<Data>,
    WithActionBuilder<Data> {
  private readonly actionReplyHandlers: ReplyHandlers<Data> = new Map();
  private readonly compensationReplyHandlers: ReplyHandlers<Data> = new Map();
  private action?: BaseParticipantInvocation<Data>;
  private compensation?: BaseParticipantInvocation<Data>;

  constructor(private readonly parent: SimpleSagaDefinitionBuilder<Data>) {}

  private addStep(): void {
    this.parent.addStep(
      new ParticipantInvocationStep<Data>(
        this.actionReplyHandlers,
        this.compensationReplyHandlers,
        this.action,
        this.compensation,
      ),
    );
  }

  withAction(
    action: CommandProvider<Data, CommandWithDestination>,
    participantInvocationPredicate?: Predicate<Data>,
  ): this;
  withAction<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): this;
  withAction(
    actionOrCommandEndpoint,
    commandProviderOrPredicate,
    invocationPredicate?,
  ): this {
    if (actionOrCommandEndpoint instanceof CommandEndpoint) {
      this.action = new ParticipantEndpointInvocation(
        actionOrCommandEndpoint,
        commandProviderOrPredicate,
        invocationPredicate,
      );
    } else {
      this.action = new ParticipantInvocation(
        actionOrCommandEndpoint,
        commandProviderOrPredicate,
      );
    }

    return this;
  }

  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
  ): this;
  withCompensation(
    compensationPredicate: Predicate<Data>,
    compensation: Compensation<Data, CommandWithDestination>,
  ): this;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): this;
  withCompensation<C extends Command>(
    compensationPredicate: Predicate<Data>,
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): this;
  withCompensation(
    compensationPredicate,
    compensation?,
    commandProvider?,
  ): this {
    if (compensationPredicate instanceof CommandEndpoint) {
      // 1: commandEndpoint
      // 2: commandProvider
      this.compensation = new ParticipantEndpointInvocation(
        compensationPredicate,
        compensation,
      );
    } else if (compensation instanceof CommandEndpoint) {
      // 1: compensationPredicate
      // 2: commandEndpoint
      // 3: commandProvider
      this.compensation = new ParticipantEndpointInvocation(
        compensation,
        commandProvider,
        compensationPredicate,
      );
    } else if (arguments.length > 1) {
      // 1: compensationPredicate
      // 2: compensation
      this.compensation = new ParticipantInvocation(
        compensation,
        compensationPredicate,
      );
    } else {
      // 1: compensation
      this.compensation = new ParticipantInvocation(compensation);
    }

    return this;
  }

  onReply<T>(
    replyType: Type<T>,
    replyHandler: SagaStepReplyHandler<Data, T>,
  ): this {
    if (this.compensation) {
      this.compensationReplyHandlers.set(replyType.name, replyHandler);
    } else {
      this.actionReplyHandlers.set(replyType.name, replyHandler);
    }

    return this;
  }

  step(): StepBuilder<Data> {
    this.addStep();
    return new StepBuilder<Data>(this.parent);
  }

  build(): SagaDefinition<Data> {
    this.addStep();
    return this.parent.build();
  }
}
