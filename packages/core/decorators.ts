import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { EventsHandler } from '@nestjs/cqrs';

import { Type } from '@nest-convoy/common';
import { CommandType } from '@nest-convoy/commands';
import { AggregateRoot } from '@nest-convoy/events';

import { ICommandHandler, IEventHandler } from './handlers';
import {
  SAGA_COMMAND_HANDLER_METADATA,
  AGGREGATE_TYPE_METADATA,
  FROM_CHANNEL_METADATA,
  HAS_COMMAND_HANDLER_METADATA,
  DOMAIN_EVENT_HANDLER,
} from './tokens';

export function FromChannel(channel: string) {
  return (target: Type<ICommandHandler<any>>): void => {
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}

export function OnEvent<E, T>(event: Type<E>) {
  return (target: T, propertyKey: string): void => {
    Reflect.defineMetadata(DOMAIN_EVENT_HANDLER, target, propertyKey);
  };
}

export function CommandDestination(channel: string): ClassDecorator {
  return () => {};
}

interface MessageHandlerOptions {
  withLock?: boolean;
  destination?: string;
}

export function OnMessage<M>(
  message: Type<M>,
  replyOptions: MessageHandlerOptions = {},
) {
  return (target: any, propertyKey: string): void => {};
}

// TODO: Rename decorator to DomainEventHandlers
export function DomainEventsConsumer<T extends AggregateRoot>(
  aggregateType: string | (() => Type<T>),
): ClassDecorator {
  return target => {
    EventsHandler()(target);
    Reflect.defineMetadata(
      AGGREGATE_TYPE_METADATA,
      () => {
        return typeof aggregateType === 'function'
          ? aggregateType().name
          : aggregateType;
      },
      target,
    );
  };
}

export function SagaCommandHandlers(channel: string) {
  return (target: any) =>
    SagaCommandHandler(undefined as never, channel)(target);
}

export function SagaCommandHandler(command: CommandType, channel: string) {
  return (target: Type<ICommandHandler<any>>): void => {
    if (Reflect.hasMetadata(COMMAND_HANDLER_METADATA, target)) {
      Reflect.defineMetadata(HAS_COMMAND_HANDLER_METADATA, true, target);
    } else {
      Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
    }

    Reflect.defineMetadata(SAGA_COMMAND_HANDLER_METADATA, command, target);
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}

export function ForAggregateType<T extends AggregateRoot>(
  aggregateType: string | (() => Type<T>),
) {
  return (target: Type<IEventHandler<any>>): void => {
    Reflect.defineMetadata(
      AGGREGATE_TYPE_METADATA,
      () => {
        return typeof aggregateType === 'function'
          ? aggregateType().name
          : aggregateType;
      },
      target,
    );
  };
}
