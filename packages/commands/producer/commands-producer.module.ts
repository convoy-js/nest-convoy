import { Global, Module } from '@nestjs/common';
import { NestConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { NestConvoyCommandProducer } from './command-producer';

@Module({
  // imports: [NestConvoyMessagingProducerModule],
  providers: [NestConvoyCommandProducer],
  exports: [NestConvoyCommandProducer],
})
export class NestConvoyCommandsProducerModule {}
