import { Module } from '@nestjs/common';

import { SagaOrchestrationModule } from './orchestration';
import { SagaParticipantModule } from './participant';
import { SagaCommonModule } from './common';

@Module({
  imports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
  exports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
})
export class ConvoySagasModule {}
