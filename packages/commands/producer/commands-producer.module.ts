import { Module } from '@nestjs/common';

import { ConvoyCommandProducer } from './command-producer';

@Module({
  providers: [ConvoyCommandProducer],
  exports: [ConvoyCommandProducer],
})
export class ConvoyCommandsProducerModule {}
