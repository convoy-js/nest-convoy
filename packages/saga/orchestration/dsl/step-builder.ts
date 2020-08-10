import { Command, CommandProvider } from '@nest-convoy/commands/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Consumer, Predicate } from '@nest-convoy/common';

import { SagaDefinition } from '../saga-definition';
import { SimpleSagaDefinitionBuilder } from './simple-saga-definition-builder';
import { InvokeParticipantStepBuilder } from './invoke-participant-step-builder';
import { CommandEndpoint } from './command-endpoint';
import { LocalStepBuilder } from './local-step-builder';
import { Compensation, WithCompensationBuilder } from './with-builder';
// import { SimpleSaga } from './simple-saga';

export interface BaseStepBuilder<Data> {
  step(): StepBuilder<Data>;
  build(): SagaDefinition<Data>;
}

export class StepBuilder<Data> implements WithCompensationBuilder<Data> {
  constructor(
    private readonly parent: SimpleSagaDefinitionBuilder<Data>, // private readonly saga?: SimpleSaga<Data>,
  ) {}

  invokeLocal(handler: Consumer<Data>): LocalStepBuilder<Data> {
    return new LocalStepBuilder<Data>(
      this.parent,
      handler /*.bind(this.saga)*/,
    );
  }

  invokeParticipant(
    action: CommandProvider<Data, CommandWithDestination>,
    participantInvocationPredicate?: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  invokeParticipant<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  invokeParticipant(
    actionOrCommandEndpoint,
    commandProviderOrPredicate,
    invocationPredicate?,
  ): InvokeParticipantStepBuilder<Data> {
    return new InvokeParticipantStepBuilder<Data>(this.parent).withAction(
      actionOrCommandEndpoint,
      commandProviderOrPredicate,
      invocationPredicate,
    );
  }

  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation(
    compensationPredicate: Predicate<Data>,
    compensation: Compensation<Data, CommandWithDestination>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    compensationPredicate: Predicate<Data>,
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation(
    compensationPredicate,
    compensation?,
    commandProvider?,
  ): InvokeParticipantStepBuilder<Data> {
    return new InvokeParticipantStepBuilder<Data>(this.parent).withCompensation(
      compensationPredicate,
      compensation,
      commandProvider,
    );
  }
}
