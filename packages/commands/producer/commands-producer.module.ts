import { Global, Module } from '@nestjs/common';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { ConvoyCommandProducer } from './command-producer';

@Module({
  // imports: [ConvoyMessagingProducerModule],
  providers: [ConvoyCommandProducer],
  exports: [ConvoyCommandProducer],
})
export class ConvoyCommandsProducerModule {}
