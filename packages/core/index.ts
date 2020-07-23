import { Type } from '@nestjs/common';

export interface Action<T = any> extends Type<T> {
  type: string;
}

export { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
export * from './handles';
export * from './dispatcher-factory';
