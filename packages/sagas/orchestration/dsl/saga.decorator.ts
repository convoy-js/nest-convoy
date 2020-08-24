import { Injectable, Scope, Type } from '@nestjs/common';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

import { NestSaga } from './nest-saga';

export function Saga<Data>(data: Type<Data>) {
  return (target: Type<NestSaga<Data>>) => {
    Injectable(/*{ scope: Scope.REQUEST }*/)(target);
    Reflect.defineMetadata(
      SAGA_METADATA,
      {
        target,
        data,
      },
      target,
    );
  };
}
