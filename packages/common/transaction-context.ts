import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from './types';

@Injectable()
export class ConvoyTransactionContext<T = unknown> {
  get(): T | undefined {
    return undefined;
  }

  async create(cb: AsyncLikeFn<[], void>): Promise<void> {
    await cb();
  }
}
