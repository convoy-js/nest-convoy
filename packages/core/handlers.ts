import { DomainEvent, DomainEventEnvelope } from '@nest-convoy/events';
import { Message } from '@nest-convoy/messaging';
import { Command, CommandMessage } from '@nest-convoy/commands';
import { Reply } from '@nest-convoy/common';

export interface IEventHandler<E extends DomainEvent> {
  handle(dee: DomainEventEnvelope<E>): Promise<void> | void;
}

export interface ICommandHandler<
  C extends Command,
  T = Message | Reply | void
> {
  execute(cm: CommandMessage<C>): Promise<T> | T;
}

// export interface IQueryHandler<Q extends Query> {}
