import { Injectable } from '@nestjs/common';

import { Saga } from './saga';
import { SagaManager } from './saga-manager';
import { SagaManagerFactory } from './saga-manager-factory';
import { SagaInstance } from './saga-instance';

@Injectable()
export class SagaInstanceFactory {
  private sagaManagers = new WeakMap<Saga<any>, SagaManager<any>>();

  constructor(private readonly sagaManagerFactory: SagaManagerFactory) {}

  private async createSagaManager<SagaData>(
    saga: Saga<SagaData>,
  ): Promise<SagaManager<SagaData>> {
    const sagaManager = this.sagaManagerFactory.create<SagaData>(saga);
    await sagaManager.subscribeToReplyChannel();
    return sagaManager;
  }

  async create<SagaData>(
    saga: Saga<SagaData>,
    data: SagaData,
  ): Promise<SagaInstance<SagaData>> {
    if (!this.sagaManagers.has(saga)) {
      const sagaManager = await this.createSagaManager(saga);
      this.sagaManagers.set(saga, sagaManager);
    }

    return this.sagaManagers.get(saga).create(data);
  }
}
