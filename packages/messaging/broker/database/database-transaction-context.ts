import { MikroORM, TransactionContext } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from '@nest-convoy/common';
import { ConvoyTransactionContext } from '@nest-convoy/common';

export let databaseTransactionContext: DatabaseTransactionContext | undefined;

@Injectable()
export class DatabaseTransactionContext extends ConvoyTransactionContext<EntityManager> {
  constructor(private readonly orm: MikroORM) {
    super();
    databaseTransactionContext = this;
  }

  get(): EntityManager | undefined {
    return TransactionContext.getEntityManager();
  }

  async create<V>(cb: AsyncLikeFn<[], V>): Promise<V> {
    const em = this.orm.em.fork(true, true);

    return TransactionContext.createAsync(em, async () => {
      await em.begin();

      try {
        const res = await cb();
        await em.commit();
        return res;
      } catch (err) {
        await em.rollback();
        throw err;
      }
    });
  }
}
