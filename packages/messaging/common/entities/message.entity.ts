import {
  CreateDateColumn,
  PrimaryColumn,
  Column,
  Entity,
  Index,
  VersionColumn,
} from 'typeorm';

import { MessageHeaders, MessageRecordHeaders } from '../message-headers';

@Index('message_published_idx', ['published', 'id'])
@Entity('message')
export class MessageEntity<Payload> {
  @PrimaryColumn()
  id: string;

  @Column()
  destination: string;

  @Column()
  partition: number;

  @Column({
    type: 'simple-json',
    transformer: {
      to(headers: MessageRecordHeaders): MessageHeaders {
        return MessageHeaders.fromRecord(headers);
      },
      from(headers: MessageHeaders): MessageRecordHeaders {
        return headers.asRecord();
      },
    },
  })
  headers: MessageHeaders;

  @Column({ type: 'simple-json' })
  payload: Payload;

  @Column()
  published: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'creation_time',
    default: () => 'LOCALTIMESTAMP',
  })
  creationTime: string;

  @VersionColumn()
  version: string;
}
