import { classToPlain } from '@deepkit/type';
import { Type } from '@nestjs/common';

import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Instance, ObjectLiteral } from '@nest-convoy/common';

export class MessageBuilder {
  static withMessage(message: Message): MessageBuilder {
    return new MessageBuilder(message);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  static withPayload(payload: string | ObjectLiteral = '{}'): MessageBuilder {
    if (payload instanceof Error) {
      payload = {
        name: payload.name,
        message: payload.message,
        stack: payload.stack,
      };
    } else if (typeof payload !== 'string') {
      const plain = classToPlain(payload.constructor as Type, payload);
      return new MessageBuilder(plain, payload as ObjectLiteral);
    } else {
      payload = JSON.parse(payload) as ObjectLiteral;
    }

    return new MessageBuilder(payload as ObjectLiteral | Message);
  }

  protected headers = new MessageHeaders();
  protected body: ObjectLiteral;

  constructor(messageOrPayload: ObjectLiteral | Message, reference?: Instance) {
    if (messageOrPayload instanceof Message) {
      this.body = messageOrPayload.getPayload();
      this.headers = messageOrPayload.getHeaders();
    } else {
      this.body = messageOrPayload;
    }

    if (reference) {
      this.withReference(reference);
    }
  }

  withReference(reference: Instance): this {
    this.headers.set(Message.TYPE, reference.constructor.name);
    return this;
  }

  withHeader(name: string, value: string | number): this {
    this.headers.set(name, value);
    return this;
  }

  withExtraHeaders(headers: MessageHeaders): this {
    this.headers = new MessageHeaders([...this.headers, ...headers]);
    return this;
  }

  build(): Message {
    return new Message(this.body, this.headers);
  }
}
