import { Column, Entity, Index } from 'typeorm';

@Index('received_messages_pkey', ['consumerId', 'messageId'], { unique: true })
@Entity('received_messages', { schema: 'eventuate' })
export class ReceivedMessages {
  @Column('character varying', {
    primary: true,
    name: 'consumer_id',
    length: 1000,
  })
  consumerId: string;

  @Column('character varying', {
    primary: true,
    name: 'message_id',
    length: 1000,
  })
  messageId: string;

  @Column('bigint', { name: 'creation_time', nullable: true })
  creationTime: string | null;
}
