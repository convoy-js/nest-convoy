import {
  CreateDateColumn,
  PrimaryColumn,
  Column,
  Entity,
  Index,
  VersionColumn,
} from 'typeorm';

import { MessageHeaders, MessageRecordHeaders } from '../message-headers';

// @Index('message_pkey', ['id'], { unique: true })
@Entity('message')
export class MessageEntity<P> {
  @PrimaryColumn()
  id: string;

  @Column('text')
  destination: string;

  @Column({
    type: 'json',
    nullable: true,
    transformer: {
      to(headers: MessageHeaders): MessageRecordHeaders {
        return headers.asRecord();
      },
      from(headers: MessageRecordHeaders): MessageHeaders {
        return MessageHeaders.fromRecord(headers);
      },
    },
  })
  headers: MessageHeaders;

  @Column({ type: 'json', nullable: true })
  payload: P;

  @Column({
    type: 'smallint',
    // default: () => 0,
    nullable: true,
    transformer: {
      to(value: boolean | undefined): number {
        return value != null ? +value : 0;
      },
      from(value: number): boolean | null {
        return value != null ? !!value : null;
      },
    },
  })
  published?: boolean;

  @Column({
    type: 'bigint',
    name: 'creation_time',
    nullable: true,
    // default: () => Date.now(),
    transformer: {
      from(value: Date | undefined): number {
        return value instanceof Date ? +value : Date.now();
      },
      to(value: number): Date | null {
        return value != null ? new Date(value) : null;
      },
    },
  })
  creationTime?: Date;
}
