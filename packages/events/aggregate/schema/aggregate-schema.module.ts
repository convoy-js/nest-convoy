import { Module } from '@nestjs/common';

import { DefaultEventSchemaManager } from './event-schema-manager';
import { ConfigurableEventSchema } from './configurable-event-schema';

@Module({
  providers: [DefaultEventSchemaManager, ConfigurableEventSchema],
  exports: [DefaultEventSchemaManager, ConfigurableEventSchema],
})
export class AggregateSchemaModule {}
