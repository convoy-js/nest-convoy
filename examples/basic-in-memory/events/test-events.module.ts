import { Module } from '@nestjs/common';
import { ConvoyCommonModule } from '@nest-convoy/core';

import { TestEventService } from './test-event.service';
import { AccountDebitedHandler } from './account-debited.handler';

@Module({
  imports: [ConvoyCommonModule],
  providers: [TestEventService, AccountDebitedHandler],
})
export class TestEventsModule {}
