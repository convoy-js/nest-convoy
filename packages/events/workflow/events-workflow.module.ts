import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';

import { AggregateCrudModule } from '@nest-convoy/events/aggregate/crud';
import { AggregateSchemaModule } from '@nest-convoy/events/aggregate/schema';

import { EventDispatcherInitializer } from './event-dispatcher-initializer';

// @Global()
@Module({
  imports: [DiscoveryModule, AggregateCrudModule, AggregateSchemaModule],
  providers: [EventDispatcherInitializer],
})
export class EventsWorkflowModule {}
