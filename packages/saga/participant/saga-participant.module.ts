import { Module } from '@nestjs/common';
import { SagaCommonModule } from '@nest-convoy/saga/common';

import { SagaCommandDispatcherFactory } from './saga-command-dispatcher-factory';

@Module({
  imports: [SagaCommonModule],
  providers: [SagaCommandDispatcherFactory],
  exports: [SagaCommandDispatcherFactory],
})
export class SagaParticipantModule {}
