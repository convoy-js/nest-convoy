import { Command, CommandMessageHandler } from '@nest-convoy/commands';
import { DomainEvent, DomainEventMessageHandler } from '@nest-convoy/events';

export interface IEventHandler<E extends DomainEvent> {
  handle: DomainEventMessageHandler<E>;
}

export interface ICommandHandler<C extends Command, T = any> {
  execute: CommandMessageHandler<C, T>;
}

// export interface IQueryHandler<Q extends Query> {}
