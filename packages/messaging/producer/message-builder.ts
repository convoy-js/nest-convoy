import { Injectable } from '@nestjs/common';
import { Message, MessageHeaders } from '../common';

export class MessageBuilder {
  private readonly headers: MessageHeaders = new Map();
  private readonly body: string;

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

  static withPayload(payload: string): MessageBuilder {
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
