import type { AsyncLikeFn, Predicate } from '@nest-convoy/common';
import type { CommandWithDestination } from '@nest-convoy/commands/consumer';
import type { Command, CommandProvider } from '@nest-convoy/commands/common';
import type { CommandEndpoint } from './command-endpoint';

export type Compensation<
  T,
  C extends Command = Command | CommandWithDestination,
> = AsyncLikeFn<[data: T], C>;

export type WithEndpointArgs<Data, C extends Command> = [
  CommandEndpoint<C>,
  CommandProvider<Data, C>,
  Predicate<Data>?,
];

export type WithoutEndpointArgs<
  Data,
  C extends Command | CommandWithDestination<C>,
> = [CommandProvider<Data, C>, Predicate<Data>?];

export type WithDestinationArgs<Data, C extends Command> = WithoutEndpointArgs<
  Data,
  CommandWithDestination<C>
>;

export type WithArgs<Data, C extends Command> =
  | WithEndpointArgs<Data, C>
  | WithoutEndpointArgs<Data, C>;

export interface WithActionBuilder<Data> {
  withAction<C extends Command>(
    action: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): unknown;
  withAction<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: CommandProvider<Data, C>,
    participantInvocationPredicate?: Predicate<Data>,
  ): unknown;
  withAction<C extends Command>(...args: WithArgs<Data, C>): unknown;
}

export interface WithCompensationBuilder<Data> {
  withCompensation<C extends Command>(
    compensation: Compensation<Data, C>,
  ): unknown;
  withCompensation<C extends Command>(
    compensation: Compensation<Data, C>,
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
  withCompensation<C extends Command>(...args: WithArgs<Data, C>): unknown;
}
