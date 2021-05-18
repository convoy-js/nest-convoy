import { Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ConvoyCommandsProducerModule } from '@nest-convoy/commands';
import { SagaCommonModule } from '@nest-convoy/sagas/common';
import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { SagaInstance, SagaInstanceParticipants } from './entities';
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
    MikroOrmModule.forFeature({
      entities: [SagaInstance, SagaInstanceParticipants],
    }),
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
    MikroOrmModule,
    SagaInstanceFactory,
    SagaInstanceRepository,
    SagaManagerFactory,
    SagaCommandProducer,
  ],
})
export class SagaOrchestrationModule {}
