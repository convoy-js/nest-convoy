import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

import { MissingSagaManagerException } from '@nest-convoy/sagas/common';

import { Saga } from './saga';
import { SagaManager } from './saga-manager';
import { SagaManagerFactory } from './saga-manager-factory';
import { SagaInstance } from './saga-instance';

@Injectable()
export class SagaInstanceFactory implements OnModuleInit {
  private sagaManagers: WeakMap<Type<Saga<unknown>>, SagaManager<any>>;

  constructor(
    private readonly sagaManagerFactory: SagaManagerFactory,
    private readonly moduleRef: ModuleRef,
    private readonly explorer: ExplorerService,
  ) {}

  private async createSagaManager<SagaData>(
    saga: Saga<SagaData>,
  ): Promise<SagaManager<SagaData>> {
    const sagaManager = this.sagaManagerFactory.create<SagaData>(saga);
    await sagaManager.subscribeToReplyChannel();
    return sagaManager;
  }

  async onModuleInit(): Promise<void> {
    const sagas = this.explorer.explore().sagas || [];

    const sagaManagers = await Promise.all(
      sagas
        .map<[Type<Saga<unknown>>, Saga<unknown>]>(sagaType => [
          sagaType,
          this.moduleRef.get(sagaType, { strict: false }),
        ])
        .map<Promise<[Type<Saga<unknown>>, SagaManager<unknown>]>>(
          async ([sagaType, saga]) => [
            sagaType,
            await this.createSagaManager(saga),
          ],
        ),
    );

    this.sagaManagers = new WeakMap(sagaManagers);
  }

  async create<SagaData>(
    sagaType: Type<Saga<SagaData>>,
    data: SagaData,
  ): Promise<SagaInstance<SagaData>> {
    if (!this.sagaManagers.has(sagaType)) {
      throw new MissingSagaManagerException(sagaType);
    }

    return this.sagaManagers.get(sagaType)!.create(data);
  }
}
