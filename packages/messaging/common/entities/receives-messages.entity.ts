import { CreateDateColumn, PrimaryColumn, Entity } from 'typeorm';

@Entity('received_messages')
export class ReceivedMessagesEntity {
  @PrimaryColumn({ name: 'consumer_id' })
  consumerId: string;

  @PrimaryColumn({ name: 'message_id' })
  messageId: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'creation_time',
    default: () => 'LOCALTIMESTAMP',
  })
  creationTime: string;
}
