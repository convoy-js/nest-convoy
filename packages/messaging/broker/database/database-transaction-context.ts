import { MikroORM, TransactionContext } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from '@nest-convoy/common';
import { ConvoyTransactionContext } from '@nest-convoy/common';

@Injectable()
export class DatabaseTransactionContext extends ConvoyTransactionContext<EntityManager> {
  constructor(private readonly orm: MikroORM) {
    super();
  }

  get(): EntityManager | undefined {
    return TransactionContext.getEntityManager();
  }

  async create(cb: AsyncLikeFn<[], void>): Promise<void> {
    const em = this.orm.em.fork(true, true);

    await TransactionContext.createAsync(em, async () => {
      await em.begin();

      try {
        await cb();
        await em.commit();
      } catch (err) {
        await em.rollback();
        throw err;
      }
    });
  }
}
