import { Entity, PrimaryKey, PrimaryKeyType, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'entities' })
export class Entities {
  @PrimaryKey()
  id = uuidv4();

  @PrimaryKey()
  type: string;

  [PrimaryKeyType]: [string, string];

  @Property()
  version: string;
}
