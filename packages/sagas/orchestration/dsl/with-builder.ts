import { AsyncFn, Predicate } from '@nest-convoy/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Command, CommandProvider } from '@nest-convoy/commands/common';

import { CommandEndpoint } from './command-endpoint';

export type Compensation<
  T,
  C extends Command = Command | CommandWithDestination
> = AsyncFn<[data: T], C>;

export interface WithActionBuilder<Data> {
  withAction(
    action: CommandProvider<Data, CommandWithDestination>,
    participantInvocationPredicate?: Predicate<Data>,
  ): unknown;
  withAction<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): unknown;
}

export interface WithCompensationBuilder<Data> {
  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
  ): unknown;
  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
    compensationPredicate: Predicate<Data>,
  ): unknown;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): unknown;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
    compensationPredicate: Predicate<Data>,
  ): unknown;
}
