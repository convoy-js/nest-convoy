import { Module } from '@nestjs/common';
import { ConvoyCqrsModule } from '@nest-convoy/cqrs';

import { TestEventService } from './test-event.service';
import { AccountDebitedHandler } from './account-debited.handler';

@Module({
  imports: [ConvoyCqrsModule],
  providers: [TestEventService, AccountDebitedHandler],
})
export class TestEventsModule {}
