import { Global, Module } from '@nestjs/common';

import { AGGREGATE_EVENTS } from '@nest-convoy/events/aggregate/aggregate-events';

import { KafkaAggregateSubscriptions } from './kafka-aggregate-subscriptions';

// @Global()
@Module({
  providers: [
    {
      provide: AGGREGATE_EVENTS,
      useClass: KafkaAggregateSubscriptions,
    },
  ],
  exports: [AGGREGATE_EVENTS],
})
export class EventsWorkflowKafkaModule {}
