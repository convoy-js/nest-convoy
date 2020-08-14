import { DomainEvent, DomainEventEnvelope } from '@nest-convoy/events';
import { Message } from '@nest-convoy/messaging';
import { Command, CommandMessage } from '@nest-convoy/commands';

export interface IEventHandler<E extends DomainEvent> {
  handle(dee: DomainEventEnvelope<E>): Promise<void | Message> | void | Message;
}

export interface ICommandHandler<C extends Command, T = void | Message | any> {
  execute(cm: CommandMessage<C>): Promise<T> | T;
}

// export interface IQueryHandler<Q extends Query> {}
