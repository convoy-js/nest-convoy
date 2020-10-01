import { Type } from '@nestjs/common';

import { Command, CommandProvider } from '@nest-convoy/commands/common';
import {
  COMMAND_WITH_DESTINATION,
  CommandWithDestination,
} from '@nest-convoy/commands/consumer';
import { Predicate } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
import { BaseStepBuilder, StepBuilder } from './step-builder';
import { SagaStepReply, SagaStepReplyHandler } from './saga-step';
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

  // private isCommandWithDestinationProvider<C extends Command>(
  //   fn: any,
  // ): fn is CommandProvider<Data, C> {
  //   return Reflect.hasMetadata(COMMAND_WITH_DESTINATION, fn);
  // }

  // Adds support for @CommandDestination()
  private wrapCommandProvider<C extends Command>(args: any[]): void {
    const action = args[0];
    let destination: string | undefined;
    // if (this.isCommandWithDestinationProvider<C>(args[0])) {
    destination = Reflect.getMetadata(COMMAND_WITH_DESTINATION, args[0]);
    // }

    args[0] = async (data: Data): Promise<CommandWithDestination<C> | C> => {
      const cmd = await action(data);
      // if (Reflect.hasMetadata(COMMAND_WITH_DESTINATION, cmd.constructor)) {
      if (!destination) {
        destination = Reflect.getMetadata(
          COMMAND_WITH_DESTINATION,
          cmd.constructor,
        );
      }
      // }
      if (destination) {
        return new CommandWithDestination<C>(destination, cmd as never);
      }

      return cmd;
    };
  }

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

  withAction<C extends Command>(
    action: CommandProvider<Data, CommandWithDestination<C> | C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): this;
  withAction<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): this;
  withAction(...args: any[]): this {
    this.wrapCommandProvider(args);

    if (args[0] instanceof CommandEndpoint) {
      this.action = new ParticipantEndpointInvocation(
        args[0],
        args[1].bind(this.parent.saga),
        args[2].bind(this.parent.saga),
      );
    } else {
      this.action = new ParticipantInvocation(
        args[0].bind(this.parent.saga),
        args[1].bind(this.parent.saga),
      );
    }

    return this;
  }

  withCompensation<C extends Command>(
    compensation: Compensation<Data, CommandWithDestination<C> | C>,
  ): this;
  withCompensation<C extends Command>(
    compensation: Compensation<Data, CommandWithDestination<C> | C>,
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
    this.wrapCommandProvider(args);

    // eslint-disable-next-line prefer-rest-params
    if (arguments[0] instanceof CommandEndpoint) {
      this.compensation = new ParticipantEndpointInvocation(
        args[0],
        args[1].bind(this.parent.saga),
        args[2].bind(this.parent.saga),
      );
    } else {
      this.compensation = new ParticipantInvocation(
        args[0].bind(this.parent.saga),
        args[1].bind(this.parent.saga),
      );
    }

    return this;
  }

  onReply<T, R>(
    replyType: Type<T>,
    replyHandler: SagaStepReplyHandler<Data, R>,
  ): this {
    replyHandler = replyHandler.bind(this.parent.saga);
    const store: SagaStepReply<Data, R> = {
      type: replyType,
      handler: replyHandler.bind(this.parent.saga),
    };

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
