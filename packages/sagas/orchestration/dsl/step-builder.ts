import { Command, CommandProvider } from '@nest-convoy/commands/common';
import { Consumer, Predicate } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
import { InvokeParticipantStepBuilder } from './invoke-participant-step-builder';
import { CommandEndpoint } from './command-endpoint';
import { LocalStepBuilder } from './local-step-builder';
import {
  Compensation,
  WithArgs,
  WithCompensationBuilder,
} from './with-builder';

export interface BaseStepBuilder<Data> {
  step(): StepBuilder<Data>;
  build(): SagaDefinition<Data>;
}

export class StepBuilder<Data> implements WithCompensationBuilder<Data> {
  constructor(private readonly parent: NestSagaDefinitionBuilder<Data>) {}

  /**
   * Invokes a local action
   */
  invokeLocal(handler: Consumer<Data>): LocalStepBuilder<Data> {
    return new LocalStepBuilder<Data>(this.parent, handler);
  }

  /**
   * Invoke participant
   */
  invokeParticipant<C extends Command>(
    action: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  invokeParticipant<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  invokeParticipant<C extends Command>(
    ...args: WithArgs<Data, C>
  ): InvokeParticipantStepBuilder<Data> {
    return new InvokeParticipantStepBuilder<Data>(this.parent).withAction(
      ...args,
    );
  }

  /**
   * With compensation
   */
  withCompensation<C extends Command>(
    compensation: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    compensation: Compensation<Data, C>,
    compensationPredicate: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
    compensationPredicate: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    ...args: WithArgs<Data, C>
  ): InvokeParticipantStepBuilder<Data> {
    return new InvokeParticipantStepBuilder<Data>(this.parent).withCompensation(
      // TODO: No clue why this cannot compile, but "invokeParticipant" can
      // @ts-ignore
      ...args,
    );
  }
}
