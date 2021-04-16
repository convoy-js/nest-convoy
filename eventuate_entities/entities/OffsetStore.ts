import { Column, Entity, Index } from 'typeorm';

@Index('offset_store_pkey', ['clientName'], { unique: true })
@Entity('offset_store', { schema: 'eventuate' })
export class OffsetStore {
  @Column('character varying', {
    primary: true,
    name: 'client_name',
    length: 255,
  })
  clientName: string;

  @Column('character varying', {
    name: 'serialized_offset',
    nullable: true,
    length: 255,
  })
  serializedOffset: string | null;
}
