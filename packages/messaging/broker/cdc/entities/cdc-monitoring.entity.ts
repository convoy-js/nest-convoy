import { BigIntType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class CdcMonitoring {
  @PrimaryKey()
  readerId: string;

  @Property({
    type: BigIntType,
    nullable: true,
  })
  lastTime?: number;
}
