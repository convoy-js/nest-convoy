import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AggregateSnapshotModule } from '../snapshot';
import { AggregateCrudMapping } from './aggregate-crud-mapping';
import { AGGREGATE_CRUD, AggregateEventsCrud } from './aggregate-crud';
import { AggregateStoreCrud } from './aggregate-store-crud';
import { EntitiesEntity, EventsEntity, SnapshotsEntity } from '../entities';
import { AggregateCrudAccess } from './aggregate-crud-access';

@Module({
  imports: [
    AggregateSnapshotModule,
    TypeOrmModule.forFeature([EntitiesEntity, EventsEntity, SnapshotsEntity]),
  ],
  providers: [
    AggregateCrudMapping,
    {
      provide: AGGREGATE_CRUD,
      useClass: AggregateEventsCrud,
    },
    AggregateStoreCrud,
    AggregateCrudAccess,
  ],
  exports: [AGGREGATE_CRUD, AggregateStoreCrud, AggregateCrudAccess],
})
export class AggregateCrudModule {}
