import type { Type } from '@nestjs/common';

export class EnlistedAggregate {
  constructor(readonly aggregateType: Type, readonly aggregateId: string) {}
}
