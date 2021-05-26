import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from '@nest-convoy/common';

@Injectable()
export class ConvoyTransactionContext<T> {
  get(): T | undefined {
    return undefined;
  }

  async create(cb: AsyncLikeFn<[], void>): Promise<void> {
    await cb();
  }
}
