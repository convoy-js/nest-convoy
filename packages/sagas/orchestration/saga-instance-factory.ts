import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef, ModulesContainer } from '@nestjs/core';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { SAGA_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

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
    private readonly modulesContainer: ModulesContainer,
  ) {}

  private async createSagaManager<SagaData>(
    saga: Saga<SagaData>,
  ): Promise<SagaManager<SagaData>> {
    const sagaManager = this.sagaManagerFactory.create<SagaData>(saga);
    await sagaManager.subscribeToReplyChannel();
    return sagaManager;
  }

  async onModuleInit(): Promise<void> {
    /*
    const modules = [...this.modulesContainer.values()];
      this.explorer
        .flatMap<Saga<unknown>>(modules, instance =>
          this.explorer.filterProvider(instance, SAGA_METADATA),
        )
     */
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
      throw new Error('Missing manager for saga ' + sagaType.name);
    }

    return this.sagaManagers.get(sagaType)!.create(data);
  }
}
