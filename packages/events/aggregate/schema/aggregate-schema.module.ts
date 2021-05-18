import { Module } from '@nestjs/common';

import { ConfigurableEventSchema } from './configurable-event-schema';
import {
  DefaultEventSchemaManager,
  EVENT_SCHEMA_MANAGER,
} from './event-schema-manager';

@Module({
  providers: [
    ConfigurableEventSchema,
    {
      provide: EVENT_SCHEMA_MANAGER,
      useClass: DefaultEventSchemaManager,
    },
    DefaultEventSchemaManager,
  ],
  exports: [EVENT_SCHEMA_MANAGER, ConfigurableEventSchema],
})
export class AggregateSchemaModule {}
