import { Injectable, Type } from '@nestjs/common';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

import { SimpleSaga } from './simple-saga';

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
