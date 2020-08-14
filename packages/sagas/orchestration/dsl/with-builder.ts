import { Predicate } from '@nest-convoy/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Command, CommandProvider } from '@nest-convoy/commands/common';

import { CommandEndpoint } from './command-endpoint';

export type Compensation<
  T,
  C extends Command = Command | CommandWithDestination
> = (data: T) => Promise<C> | C;

export interface WithActionBuilder<Data> {
  withAction(
    action: CommandProvider<Data, CommandWithDestination>,
    participantInvocationPredicate?: Predicate<Data>,
  ): any;
  withAction<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): any;
}

export interface WithCompensationBuilder<Data> {
  withCompensation(
    compensationPredicate: Predicate<Data>,
    compensation: Compensation<Data, CommandWithDestination>,
  ): any;
  withCompensation(
    compensation: Compensation<Data, CommandWithDestination>,
  ): any;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): any;
  withCompensation<C extends Command>(
    compensationPredicate: Predicate<Data>,
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): any;
}
