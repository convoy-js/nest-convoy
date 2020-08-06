import { Message, MessageHeaders } from '@nest-convoy/messaging/common';

export class MessageBuilder {
  protected readonly headers: MessageHeaders = new Map();
  protected body: string;

  constructor(messageOrPayload: string | Message) {
    if (messageOrPayload instanceof Message) {
      this.body = messageOrPayload.getPayload();
      this.headers = messageOrPayload.getHeaders();
    } else {
      this.body = messageOrPayload;
    }
  }
  static withMessage(message: Message): MessageBuilder {
    return new MessageBuilder(message);
  }

  static withPayload(payload: string | object): MessageBuilder {
    if (typeof payload !== 'string') payload = JSON.stringify(payload);

    return new MessageBuilder(payload);
  }

  withHeader(name: string, value: string): this {
    this.headers.set(name, value);
    return this;
  }

  withExtraHeaders(prefix: string, headers: MessageHeaders): this {
    for (const [key, value] of headers.entries()) {
      this.headers.set(`${prefix}${key}`, value);
    }

    return this;
  }

  build(): Message {
    return new Message(this.body, this.headers);
  }
}
