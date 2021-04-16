import { Column, Entity, PrimaryColumn, VersionColumn } from 'typeorm';

import {
  MessageHeaders,
  MessageRecordHeaders,
} from '@nest-convoy/messaging/common';

@Entity('saga_stash')
export class SagaStashEntity<P = Record<string, unknown>> {
  @PrimaryColumn({ name: 'message_id' })
  messageId: string;

  @Column()
  target: string;

  @Column({ name: 'saga_type' })
  sagaType: string;

  @Column({ name: 'saga_id' })
  sagaId: string;

  @Column({
    name: 'message_headers',
    type: 'json',
    transformer: {
      to(headers: MessageRecordHeaders): MessageHeaders {
        return MessageHeaders.fromRecord(headers);
      },
      from(headers: MessageHeaders): MessageRecordHeaders {
        return headers.asRecord();
      },
    },
  })
  messageHeaders: MessageHeaders;

  @Column({ name: 'message_payload', type: 'json' })
  messagePayload: object;

  @VersionColumn()
  version: string;
}
