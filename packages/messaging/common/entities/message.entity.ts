import {
  CreateDateColumn,
  PrimaryColumn,
  Column,
  Entity,
  Index,
} from 'typeorm';

import { MessageHeaders, MessageRecordHeaders } from '../message';

@Index('message_published_idx', ['published', 'id'])
@Entity('message')
export class MessageEntity<Payload> {
  @PrimaryColumn()
  id: string;

  @Column()
  destination: string;

  @Column({
    type: 'simple-json',
    transformer: {
      to(value: MessageRecordHeaders): MessageHeaders {
        return new Map(Object.entries(value));
      },
      from(value: MessageHeaders): MessageRecordHeaders {
        return Object.fromEntries(value);
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
}
