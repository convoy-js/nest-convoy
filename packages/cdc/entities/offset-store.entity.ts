import { PrimaryKey, Entity, Property } from '@mikro-orm/core';

@Entity()
export class OffsetStore {
  @PrimaryKey({ length: 255 })
  clientName: string;

  @Property({
    nullable: true,
    length: 255,
  })
  serializedOffset?: string;
}
