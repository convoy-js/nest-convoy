import { Module } from '@nestjs/common';
import { NestConvoyEventsPublisherModule } from '@nest-convoy/events/publisher';
import { NestConvoyEventsSubscriberModule } from '@nest-convoy/events/subscriber';
import { NestConvoyCommandsConsumerModule } from '@nest-convoy/commands/consumer';
import { NestConvoyCommandsProducerModule } from '@nest-convoy/commands/producer';
import { NestConvoyInMemoryMessagingModule } from '@nest-convoy/in-memory/in-memory-messaging.module';

import { TestCommandHandler } from './test-command-handler';

@Module({
  imports: [
    NestConvoyInMemoryMessagingModule.register(),
    NestConvoyEventsPublisherModule,
    NestConvoyEventsSubscriberModule,
    NestConvoyCommandsConsumerModule,
    NestConvoyCommandsProducerModule,
  ],
  providers: [TestCommandHandler],
})
export class AppModule {}
