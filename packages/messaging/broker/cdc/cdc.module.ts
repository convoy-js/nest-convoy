import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { OffsetStore, CdcMonitoring } from './entities';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [CdcMonitoring, OffsetStore],
    }),
  ],
  exports: [MikroOrmModule],
})
export class ConvoyCdcModule {}
