import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { SagaLock, SagaStash } from './entities';
import { SagaDatabaseLockManager, SagaLockManager } from './saga-lock-manager';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [SagaLock, SagaStash],
    }),
  ],
  providers: [
    {
      provide: SagaLockManager,
      useClass: SagaDatabaseLockManager,
    },
  ],
  exports: [MikroOrmModule, SagaLockManager],
})
export class SagaCommonModule {}
