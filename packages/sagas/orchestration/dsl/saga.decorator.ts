import { Injectable } from '@nestjs/common';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

import type { Type } from '@nest-convoy/common';

import type { NestSaga } from './nest-saga';

export function Saga<Data>(data: Type<Data>) {
  return (target: Type<NestSaga<Data>>): void => {
    Injectable()(target);
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
