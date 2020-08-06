import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEST_SAGA_CONNECTION } from './tokens';

import { SagaLockEntity, SagaStashEntity } from './entities';
import { SagaDatabaseLockManager, SagaLockManager } from './saga-lock-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [SagaLockEntity, SagaStashEntity],
      NEST_SAGA_CONNECTION,
    ),
  ],
  providers: [
    SagaDatabaseLockManager,
    {
      provide: SagaLockManager,
      useExisting: SagaDatabaseLockManager,
    },
  ],
  exports: [TypeOrmModule, SagaLockManager],
})
export class SagaCommonModule {}
