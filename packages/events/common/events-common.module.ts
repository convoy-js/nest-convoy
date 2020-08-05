import { Module } from '@nestjs/common';

import { DomainEventNameMapping } from './domain-event-name-mapping';

@Module({
  providers: [DomainEventNameMapping],
  exports: [DomainEventNameMapping],
})
export class NestConvoyEventsCommonModule {}
