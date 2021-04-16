import { Column, Entity, Index } from 'typeorm';

@Index('message_pkey', ['id'], { unique: true })
@Entity('message', { schema: 'eventuate' })
export class Message {
  @Column('character varying', { primary: true, name: 'id', length: 1000 })
  id: string;

  @Column('text', { name: 'destination' })
  destination: string;

  @Column('smallint', { name: 'published', nullable: true, default: () => '0' })
  published: number | null;

  @Column('bigint', { name: 'creation_time', nullable: true })
  creationTime: string | null;

  @Column('json', { name: 'payload', nullable: true })
  payload: object | null;

  @Column('json', { name: 'headers', nullable: true })
  headers: object | null;
}
