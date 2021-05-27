import { MikroORM, TransactionContext } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';

import type { AsyncLikeFn } from '@nest-convoy/common';
import { ConvoyTransactionContext } from '@nest-convoy/common';

@Injectable()
export class DatabaseTransactionContext extends ConvoyTransactionContext<EntityManager> {
  private static instance?: DatabaseTransactionContext;

  static getEntityManager(): EntityManager | undefined {
    return DatabaseTransactionContext.instance?.get();
  }

  static async create<V>(cb: AsyncLikeFn<[], V>): Promise<V> {
    return DatabaseTransactionContext.instance!.create(cb);
  }

  constructor(private readonly orm: MikroORM) {
    super();
    DatabaseTransactionContext.instance = this;
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
