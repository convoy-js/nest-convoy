import {
  CreateDateColumn,
  PrimaryColumn,
  Entity,
  VersionColumn,
  Index,
  Column,
} from 'typeorm';

// @Index('received_messages_pkey', ['consumerId', 'messageId'], { unique: true })
@Entity('received_messages')
export class ReceivedMessagesEntity {
  @PrimaryColumn({ name: 'consumer_id' })
  consumerId: string;

  @PrimaryColumn({ name: 'message_id' })
  messageId: string;

  @Column('bigint', { name: 'creation_time', nullable: true })
  creationTime?: string;
}
