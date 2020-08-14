import { Command, CommandProvider } from '@nest-convoy/commands/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Builder, Predicate } from '@nest-convoy/common';
import { Type } from '@nestjs/common';

import { SagaDefinition } from '../saga-definition';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
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

  constructor(private readonly parent: NestSagaDefinitionBuilder<Data>) {}

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
  withAction(...args: any[]): this {
    if (arguments[0] instanceof CommandEndpoint) {
      this.action = new ParticipantEndpointInvocation(
        args[0],
        args[1],
        args[2],
      );
    } else {
      this.action = new ParticipantInvocation(args[0], args[1]);
    }

    return this;
  }

  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
  ): this;
  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
    compensationPredicate: Predicate<Data>,
  ): this;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): this;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
    compensationPredicate: Predicate<Data>,
  ): this;
  withCompensation(...args: any[]): this {
    if (arguments[0] instanceof CommandEndpoint) {
      this.compensation = new ParticipantEndpointInvocation(
        args[0],
        args[1],
        args[2],
      );
    } else {
      this.compensation = new ParticipantInvocation(args[0], args[1]);
    }

    return this;
  }

  onReply<T>(
    replyType: Type<T>,
    replyHandler: SagaStepReplyHandler<Data, T>,
  ): this {
    replyHandler = replyHandler.bind(this.parent.saga);
    const store = { type: replyType, handler: replyHandler };

    if (this.compensation) {
      this.compensationReplyHandlers.set(replyType.name, store);
    } else {
      this.actionReplyHandlers.set(replyType.name, store);
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
