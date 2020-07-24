import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Command } from '@nest-convoy/commands/common';

import { InvokeParticipantStepBuilder } from './invoke-participant-step-builder';
import { CommandEndpoint } from './command-endpoint';

export type CompensationPredicate<T> = (data: T) => Promise<T> | T;
export type Compensation<
  T,
  C extends Command = Command | CommandWithDestination
> = (data: T) => Promise<C> | C;

export interface WithCompensationBuilder<Data> {
  withCompensation(
    compensationPredicate: CompensationPredicate<Data>,
    compensation: Compensation<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation(
    compensation: Compensation<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    compensationPredicate: CompensationPredicate<Data>,
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
}
