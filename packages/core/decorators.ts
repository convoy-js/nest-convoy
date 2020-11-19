import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';
import { EventsHandler } from '@nestjs/cqrs';

import { Type } from '@nest-convoy/common';
import { AggregateRoot } from '@nest-convoy/events';
import {
  COMMAND_WITH_DESTINATION,
  CommandMessageHandlerOptions,
} from '@nest-convoy/commands';

import {
  SAGA_COMMAND_HANDLER_METADATA,
  AGGREGATE_TYPE_METADATA,
  FROM_CHANNEL_METADATA,
  HAS_COMMAND_HANDLER_METADATA,
  DOMAIN_EVENT_HANDLER,
  COMMAND_MESSAGE_HANDLER,
  COMMAND_MESSAGE_HANDLER_OPTIONS,
} from './tokens';

export function OnEvent<E, T>(event: Type<E>) {
  return (target: T, propertyKey: string): void => {
    Reflect.defineMetadata(DOMAIN_EVENT_HANDLER, event, target, propertyKey);
  };
}

export function CommandDestination(
  channel: string,
) /*: ClassDecorator | MethodDecorator*/ {
  return (target: Function | object, propertyKey?: string) => {
    Reflect.defineMetadata(
      COMMAND_WITH_DESTINATION,
      channel,
      target,
      propertyKey as never,
    );
  };
}

export function OnMessage<M, T>(
  message: Type<M>,
  options: CommandMessageHandlerOptions<T> = {},
) {
  return (target: T, propertyKey: string): void => {
    Reflect.defineMetadata(
      COMMAND_MESSAGE_HANDLER,
      message,
      target,
      propertyKey,
    );
    Reflect.defineMetadata(
      COMMAND_MESSAGE_HANDLER_OPTIONS,
      options,
      target,
      propertyKey,
    );
  };
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

export function CommandHandlers(channel: string): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, true, target);
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}

export function SagaCommandHandlers(channel: string): ClassDecorator {
  return (target: object): void => {
    if (Reflect.hasMetadata(COMMAND_HANDLER_METADATA, target)) {
      Reflect.defineMetadata(HAS_COMMAND_HANDLER_METADATA, true, target);
    } else {
      Reflect.defineMetadata(COMMAND_HANDLER_METADATA, true, target);
    }

    Reflect.defineMetadata(SAGA_COMMAND_HANDLER_METADATA, true, target);
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}
