import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { DebeziumOutbox, OffsetStore, CdcMonitoring } from './entities';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CdcMonitoring, OffsetStore, DebeziumOutbox],
    }),
  ],
  exports: [MikroOrmModule],
})
export class ConvoyCdcModule {}
