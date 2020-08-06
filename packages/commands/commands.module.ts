import { Module } from '@nestjs/common';
import { ConvoyCommandsConsumerModule } from '@nest-convoy/commands/consumer';
import { ConvoyCommandsProducerModule } from '@nest-convoy/commands/producer';

@Module({
  imports: [ConvoyCommandsConsumerModule, ConvoyCommandsProducerModule],
  exports: [ConvoyCommandsConsumerModule, ConvoyCommandsProducerModule],
})
export class ConvoyCommandsModule {}
