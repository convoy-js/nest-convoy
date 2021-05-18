import { Entity, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { uuid } from '@deepkit/type';

@Entity({ tableName: 'entities' })
export class Entities {
  @PrimaryKey()
  id = uuid();

  @PrimaryKey()
  type: string;

  [PrimaryKeyType]: [string, string];

  @Property()
  version: string;
}
