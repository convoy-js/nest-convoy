import { Type } from '@nestjs/common';

import { FOR_AGGREGATE_TYPE_METADATA, FROM_CHANNEL_METADATA } from './tokens';
import { ICommandHandler, IEventHandler } from './handlers';

export function FromChannel(channel: string) {
  return (target: Type<ICommandHandler<any>>) => {
    Reflect.defineMetadata(FROM_CHANNEL_METADATA, channel, target);
  };
}

export function ForAggregateType<T>(aggregateType: () => Type<T>) {
  return (target: Type<IEventHandler<any>>) => {
    Reflect.defineMetadata(FOR_AGGREGATE_TYPE_METADATA, aggregateType, target);
  };
}
