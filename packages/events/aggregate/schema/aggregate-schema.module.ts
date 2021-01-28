import { Module } from '@nestjs/common';

import {
  DefaultEventSchemaManager,
  EVENT_SCHEMA_MANAGER,
} from './event-schema-manager';
import { ConfigurableEventSchema } from './configurable-event-schema';

@Module({
  providers: [
    ConfigurableEventSchema,
    {
      provide: EVENT_SCHEMA_MANAGER,
      useClass: DefaultEventSchemaManager,
    },
  ],
  exports: [EVENT_SCHEMA_MANAGER, ConfigurableEventSchema],
})
export class AggregateSchemaModule {}
