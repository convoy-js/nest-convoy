import { Type } from '@nestjs/common';

import { Snapshot } from './snapshot-strategy';

export class SerializedSnapshot<S extends Snapshot> {
  // type should be string
  constructor(readonly type: string, readonly json: string) {}
}
