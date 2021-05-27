import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from './types';

@Injectable()
export class ConvoyTransactionContext<T = unknown> {
  get(): T | undefined {
    return undefined;
  }

  async create<V>(cb: AsyncLikeFn<[], V>): Promise<V> {
    return cb();
  }
}
