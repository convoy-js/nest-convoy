import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { SagaLockEntity, SagaStashEntity } from './entities';
import { SagaDatabaseLockManager, SagaLockManager } from './saga-lock-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [SagaLockEntity, SagaStashEntity],
      NEST_CONVOY_CONNECTION,
    ),
  ],
  providers: [
    {
      provide: SagaLockManager,
      useClass: SagaDatabaseLockManager,
    },
  ],
  exports: [TypeOrmModule, SagaLockManager],
})
export class SagaCommonModule {}
