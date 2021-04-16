import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('offset_store')
export class OffsetStoreEntity {
  @PrimaryColumn({
    name: 'client_name',
    length: 255,
  })
  clientName: string;

  @Column({
    name: 'serialized_offset',
    nullable: true,
    length: 255,
  })
  serializedOffset?: string;
}
