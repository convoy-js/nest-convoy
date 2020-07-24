import { MessageHeaders } from '@nest-convoy/messaging/common';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('saga_stash')
export class SagaStash<P = Record<string, unknown>> {
  @PrimaryColumn({ name: 'message_id', length: 100 })
  messageId: string;

  @Column({ length: 100 })
  target: string;

  @Column({ name: 'saga_type', length: 255 })
  sagaType: string;

  @Column({ name: 'saga_id', length: 100 })
  sagaId: string;

  @Column({
    name: 'message_headers',
    type: 'simple-json',
    transformer: {
      to(value: Record<string, string>): MessageHeaders {
        return new Map(Object.entries(value));
      },
      from(value: MessageHeaders): Record<string, string> {
        return Object.fromEntries(value);
      },
    },
  })
  messageHeaders: MessageHeaders;

  @Column({ name: 'message_payload' })
  messagePayload: string;
}
