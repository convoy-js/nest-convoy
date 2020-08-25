import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { Instance } from '@nest-convoy/common';

import { Saga } from './saga';
import { SagaManager } from './saga-manager';
import { SagaManagerFactory } from './saga-manager-factory';
import { SagaInstance } from './saga-instance';

@Injectable()
export class SagaInstanceFactory {
  private readonly sagaManagers = new WeakMap<
    Type<Saga<unknown>>,
    SagaManager<any>
  >();

  constructor(
    private readonly sagaManagerFactory: SagaManagerFactory,
    private readonly moduleRef: ModuleRef,
  ) {}

  private async createSagaManager<SagaData>(
    saga: Saga<SagaData>,
  ): Promise<SagaManager<SagaData>> {
    const sagaManager = this.sagaManagerFactory.create<SagaData>(saga);
    await sagaManager.subscribeToReplyChannel();
    return sagaManager;
  }

  async create<SagaData>(
    sagaType: Type<Saga<SagaData>>,
    data: SagaData,
  ): Promise<SagaInstance<SagaData>> {
    if (!this.sagaManagers.has(sagaType)) {
      const saga = this.moduleRef.get(sagaType, { strict: false });
      const sagaManager = await this.createSagaManager(saga);
      this.sagaManagers.set(sagaType, sagaManager);
    }

    return this.sagaManagers.get(sagaType)!.create(data);
  }
}
