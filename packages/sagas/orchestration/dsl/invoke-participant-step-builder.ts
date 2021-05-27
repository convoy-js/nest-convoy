import type { Command } from '@nest-convoy/commands/common';
import {
  COMMAND_WITH_DESTINATION,
  CommandWithDestination,
} from '@nest-convoy/commands/consumer';
import {
  IllegalArgumentException,
  RuntimeException,
} from '@nest-convoy/common';
import type { Type } from '@nest-convoy/common';

import type { SagaDefinition } from '../saga-definition';
import { CommandEndpoint } from './command-endpoint';
import type { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
import type { BaseParticipantInvocation } from './participant-invocation';
import {
  ParticipantEndpointInvocation,
  ParticipantInvocation,
} from './participant-invocation';
import { ParticipantInvocationStep } from './participant-invocation-step';
import type { ReplyHandlers } from './participant-invocation-step';
import type { SagaStepReplyHandler } from './saga-step';
import type { BaseStepBuilder } from './step-builder';
import { StepBuilder } from './step-builder';
import type {
  WithActionBuilder,
  WithCompensationBuilder,
  WithArgs,
  WithEndpointArgs,
  WithoutEndpointArgs,
  WithDestinationArgs,
} from './with-builder';

function isEndpoint<Data, C extends Command>(
  args: WithArgs<Data, C>,
): args is WithEndpointArgs<Data, C> {
  return args[0] instanceof CommandEndpoint;
}

function isNotEndpoint<Data, C extends Command>(
  args: WithArgs<Data, C>,
): args is WithoutEndpointArgs<Data, C> {
  return !(args[0] instanceof CommandEndpoint);
}

export class InvokeParticipantStepBuilder<Data>
  implements
    BaseStepBuilder<Data>,
    WithCompensationBuilder<Data>,
    WithActionBuilder<Data>
{
  private readonly actionReplyHandlers: ReplyHandlers<Data> = new Map();
  private readonly compensationReplyHandlers: ReplyHandlers<Data> = new Map();
  private action?: BaseParticipantInvocation<Data>;
  private compensation?: BaseParticipantInvocation<Data>;

  constructor(private readonly parent: NestSagaDefinitionBuilder<Data>) {}

  private wrapCommandProvider<C extends Command>(
    args: WithoutEndpointArgs<Data, C>,
  ): WithDestinationArgs<Data, C> {
    const action = args.shift()!.bind(this.parent.saga);
    let destination = Reflect.getMetadata(COMMAND_WITH_DESTINATION, action) as
      | string
      | undefined;

    return [
      // TODO: Not entirely sure if command destination is a requirement
      async function withDestination(
        data: Data,
      ): Promise<CommandWithDestination<C>> {
        const cmd = await action(data);
        if (cmd instanceof CommandWithDestination) return cmd;

        if (!destination) {
          destination = Reflect.getMetadata(
            COMMAND_WITH_DESTINATION,
            cmd.constructor,
          );
        }

        if (!destination) {
          throw new RuntimeException(
            'Missing @CommandDestination() for ' + cmd,
          );
        }

        return new CommandWithDestination<C>(destination, cmd as C);
      },
      ...args,
    ] as unknown as WithDestinationArgs<Data, C>;
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

  private with<C extends Command>(
    args: WithArgs<Data, C>,
  ): ParticipantEndpointInvocation<Data, C> | ParticipantInvocation<Data, C> {
    if (isEndpoint(args)) {
      return new ParticipantEndpointInvocation<Data, C>(
        args[0] as CommandEndpoint<C>,
        args[1].bind(this.parent.saga),
        args[2]?.bind(this.parent.saga),
      );
    } else if (isNotEndpoint(args)) {
      const destArgs = this.wrapCommandProvider(args);
      return new ParticipantInvocation<Data, C>(
        destArgs[0].bind(this.parent.saga),
        destArgs[1]?.bind(this.parent.saga),
      );
    } else {
      throw new IllegalArgumentException(args[0]);
    }
  }

  withAction<C extends Command>(...args: WithArgs<Data, C>): this {
    this.action = this.with(args);
    return this;
  }

  /**
   * With compensation
   */
  // withCompensation<C extends Command>(
  //   compensation: Compensation<Data, C>,
  // ): this;
  // withCompensation<C extends Command>(
  //   compensation: Compensation<Data, C>,
  //   compensationPredicate: Predicate<Data>,
  // ): this;
  // withCompensation<C extends Command>(
  //   commandEndpoint: CommandEndpoint<C>,
  //   commandProvider: Compensation<Data, C>,
  // ): this;
  // withCompensation<C extends Command>(
  //   commandEndpoint: CommandEndpoint<C>,
  //   commandProvider: Compensation<Data, C>,
  //   compensationPredicate: Predicate<Data>,
  // ): this;
  withCompensation<C extends Command>(...args: WithArgs<Data, C>): this {
    this.compensation = this.with(args);
    return this;
  }

  /**
   * On reply
   */
  onReply<T, R>(type: Type<T>, handler: SagaStepReplyHandler<Data, R>): this {
    handler = handler.bind(this.parent.saga);

    if (this.compensation) {
      this.compensationReplyHandlers.set(type.name, { type, handler });
    } else {
      this.actionReplyHandlers.set(type.name, { type, handler });
    }

    return this;
  }

  /**
   * Step
   */
  step(): StepBuilder<Data> {
    this.addStep();
    return new StepBuilder<Data>(this.parent);
  }

  build(): SagaDefinition<Data> {
    this.addStep();
    return this.parent.build();
  }
}
