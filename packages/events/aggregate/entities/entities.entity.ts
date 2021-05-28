import { uuid } from '@deepkit/type';
import { Entity, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';

@Entity()
export class Entities {
  @PrimaryKey()
  id = uuid();

  @PrimaryKey()
  type: string;

  [PrimaryKeyType]: [string, string];

  @Property()
  version: string;
}
