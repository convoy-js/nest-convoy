import { Global, Module } from '@nestjs/common';

import { SagaCommonModule } from './common';
import { SagaOrchestrationModule } from './orchestration';
import { SagaParticipantModule } from './participant';

// @Global()
@Module({
  imports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
  exports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
})
export class ConvoySagasModule {}
