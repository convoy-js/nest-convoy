import { Injectable, Type } from '@nestjs/common';
import { SimpleSaga } from '@nest-convoy/saga/orchestration/dsl';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

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

// TODO
// orders-and-customers/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/customers/service/CustomerCommandHandler.java
// orders-and-customers-spring/src/main/java/io/eventuate/examples/tram/sagas/ordersandcustomers/spring/customers/CustomerConfiguration.java
export function SagaCommandHandler() {}
