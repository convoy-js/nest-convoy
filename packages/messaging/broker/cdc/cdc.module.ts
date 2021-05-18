import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { OffsetStore, CdcMonitoringEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [CdcMonitoringEntity, OffsetStore],
      NEST_CONVOY_CONNECTION,
    ),
  ],
  exports: [TypeOrmModule],
})
export class ConvoyCdcModule {}
