import { Module } from '@nestjs/common';
import { SagaOrchestrationModule } from '@nest-convoy/saga/orchestration';
import { SagaParticipantModule } from '@nest-convoy/saga/participant';
import { SagaCommonModule } from '@nest-convoy/saga/common';

@Module({
  imports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
  exports: [SagaOrchestrationModule, SagaParticipantModule, SagaCommonModule],
})
export class ConvoySagaModule {}
