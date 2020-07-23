import { Type } from '@nestjs/common';

export interface Action<T = any> extends Type<T> {
  type: string;
}
