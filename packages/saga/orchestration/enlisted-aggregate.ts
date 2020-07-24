import { Type } from '@nestjs/common';

export class EnlistedAggregate {
  constructor(
    readonly aggregateType: Type<object>,
    readonly aggregateId: string,
  ) {}
}
