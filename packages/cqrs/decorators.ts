import { Injectable, Type } from '@nestjs/common';
import { SimpleSaga } from '@nest-convoy/saga/orchestration/dsl';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

import { FOR_AGGREGATE_TYPE_METADATA, FROM_CHANNEL_METADATA } from './tokens';
import { ICommand } from '@nestjs/cqrs';
import { ICommandHandler, IEventHandler } from './handlers';

// import { CONVOY_SAGA_DATA_TYPE } from './tokens';

export function Saga<Data>(data: Type<Data>) {
  return (target: Type<SimpleSaga<Data>>) => {
    Injectable()(target);
    Reflect.defineMetadata(
      SAGA_METADATA,
      {
        target,
        data,
      },
      target,
    );
    // Reflect.defineMetadata(CONVOY_SAGA_DATA_TYPE, data, target);
  };
}

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

// TODO
// orders-and-customers/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/customers/service/CustomerCommandHandler.java
// orders-and-customers-spring/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/spring/customers/CustomerConfiguration.java
export function SagaCommandHandler(): ClassDecorator {
  return () => {};
}
