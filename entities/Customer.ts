import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Customer {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ columnType: 'float8', fieldName: 'creditLimitAmount' })
  creditLimitAmount!: number;
}
