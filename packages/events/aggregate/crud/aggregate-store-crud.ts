import { SnapshotManager } from '../snapshot/snapshot-manager';

import { MissingApplyEventMethodStrategy } from '../missing-apply-event-method-strategy';

export class AggregateCrud {
  save() {}
  find() {}
  update() {}
}

export class AggregateStoreCrud {
  constructor(
    private readonly aggregateCrud: AggregateCrud,
    private readonly snapshotManager: SnapshotManager,
    private readonly missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<
      any
    >,
    private readonly eventSchemaManager: any[],
  ) {}
}
