import { Column, Entity, PrimaryColumn } from 'typeorm';

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
  messageHeaders: MessageHeaders;

  @Column({ name: 'message_payload' })
  messagePayload: string;
}
