import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { OutboxEvent, OffsetStore, CdcMonitoring } from './entities';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CdcMonitoring, OffsetStore, OutboxEvent],
    }),
  ],
  exports: [MikroOrmModule],
})
export class ConvoyCdcModule {}
