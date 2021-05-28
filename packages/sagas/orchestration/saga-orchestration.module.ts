import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';

import { ConvoyCommandsProducerModule } from '@nest-convoy/commands';
import { SagaCommonModule } from '@nest-convoy/sagas/common';

import { SagaInstance, SagaInstanceParticipant } from './entities';
import { SagaCommandProducer } from './saga-command-producer';
import { SagaExecutionState } from './saga-execution-state';
import { SagaInstanceFactory } from './saga-instance-factory';
import {
  SagaDatabaseInstanceRepository,
  DefaultSagaInstanceRepository,
} from './saga-instance-repository';
import { SagaManagerFactory } from './saga-manager-factory';

@Module({
  imports: [
    SagaCommonModule,
    MikroOrmModule.forFeature({
      entities: [SagaInstance, SagaInstanceParticipant, SagaExecutionState],
    }),
    ConvoyCommandsProducerModule,
  ],
  providers: [
    ExplorerService,
    SagaInstanceFactory,
    SagaManagerFactory,
    SagaCommandProducer,
    {
      provide: DefaultSagaInstanceRepository,
      useClass: SagaDatabaseInstanceRepository,
    },
  ],
  exports: [
    MikroOrmModule,
    SagaInstanceFactory,
    DefaultSagaInstanceRepository,
    SagaManagerFactory,
    SagaCommandProducer,
  ],
})
export class SagaOrchestrationModule {}
