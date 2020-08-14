import { Module } from '@nestjs/common';

import { ConvoyCommandsConsumerModule } from './consumer';
import { ConvoyCommandsProducerModule } from './producer';

@Module({
  imports: [ConvoyCommandsConsumerModule, ConvoyCommandsProducerModule],
  exports: [ConvoyCommandsConsumerModule, ConvoyCommandsProducerModule],
})
export class ConvoyCommandsModule {}
