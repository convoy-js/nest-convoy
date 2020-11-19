import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

import { ConvoyCommandsProducerModule } from '@nest-convoy/commands';
import { SagaCommonModule } from '@nest-convoy/sagas/common';
import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { SagaInstanceEntity, SagaInstanceParticipantsEntity } from './entities';
import { SagaInstanceFactory } from './saga-instance-factory';
import { SagaManagerFactory } from './saga-manager-factory';
import { SagaCommandProducer } from './saga-command-producer';
import {
  SagaDatabaseInstanceRepository,
  SagaInstanceRepository,
} from './saga-instance-repository';

@Module({
  imports: [
    SagaCommonModule,
    TypeOrmModule.forFeature(
      [SagaInstanceEntity, SagaInstanceParticipantsEntity],
      NEST_CONVOY_CONNECTION,
    ),
    ConvoyCommandsProducerModule,
  ],
  providers: [
    ExplorerService,
    SagaInstanceFactory,
    SagaManagerFactory,
    SagaCommandProducer,
    {
      provide: SagaInstanceRepository,
      useClass: SagaDatabaseInstanceRepository,
    },
  ],
  exports: [
    TypeOrmModule,
    SagaInstanceFactory,
    SagaInstanceRepository,
    SagaManagerFactory,
    SagaCommandProducer,
  ],
})
export class SagaOrchestrationModule {}
