import { Type } from '@nestjs/common';

import { Snapshot } from '../snapshot';

export class SerializedSnapshot<S extends Snapshot> {
  constructor(readonly type: Type<S>, readonly json: string) {}
}
