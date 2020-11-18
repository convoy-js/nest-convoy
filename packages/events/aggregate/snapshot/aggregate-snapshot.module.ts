import { Module } from '@nestjs/common';

import { SnapshotManager } from './snapshot-manager';

@Module({
  providers: [SnapshotManager],
  exports: [SnapshotManager],
})
export class AggregateSnapshotModule {}
