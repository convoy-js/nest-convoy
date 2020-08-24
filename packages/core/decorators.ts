import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

import { isType, Type } from '@nest-convoy/common';
import { CommandType } from '@nest-convoy/commands';

import { ICommandHandler, IEventHandler } from './handlers';
import {
  SAGA_COMMAND_HANDLER_METADATA,
  FOR_AGGREGATE_TYPE_METADATA,
  FROM_CHANNEL_METADATA,
  HAS_COMMAND_HANDLER_METADATA,
} from './tokens';

export function FromChannel(channel: string) {
  return (target: Type<ICommandHandler<any>>) => {
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}

export function SagaCommandHandler(command: CommandType) {
  return (target: Type<ICommandHandler<any>>) => {
    if (Reflect.hasMetadata(COMMAND_HANDLER_METADATA, target)) {
      Reflect.defineMetadata(HAS_COMMAND_HANDLER_METADATA, true, target);
    } else {
      Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
    }

    Reflect.defineMetadata(SAGA_COMMAND_HANDLER_METADATA, command, target);
  };
}

export function ForAggregateType<T>(aggregateType: string | (() => Type<T>)) {
  return (target: Type<IEventHandler<any>>) => {
    Reflect.defineMetadata(
      FOR_AGGREGATE_TYPE_METADATA,
      () => {
        return typeof aggregateType === 'function'
          ? aggregateType().name
          : aggregateType;
      },
      target,
    );
  };
}
