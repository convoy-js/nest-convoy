import { Type } from '@nestjs/common';
import {
  plainToClass,
  validatedPlainToClass,
  ValidationFailed,
} from '@deepkit/type';

import { MissingMessageHeaderException } from './exceptions';
import { MessageHeaders } from './message-headers';

export class Message {
  static ID = 'id';
  static PARTITION_ID = 'partition_id';
  static DESTINATION = 'destination';
  static DATE = 'date';
  static TYPE = 'type';

  get id(): string {
    return this.getRequiredHeader(Message.ID);
  }

  get partition(): number {
    return +this.getRequiredHeader(Message.PARTITION_ID);
  }

  get type(): string {
    return this.getRequiredHeader(Message.TYPE);
  }

  constructor(
    protected payload: any,
    protected headers = new MessageHeaders(),
  ) {}

  toString(): string {
    return JSON.stringify({
      payload: this.payload,
      headers: this.getHeaders().asRecord(),
      type: this.type,
    });
  }

  setPayload(payload: object): this {
    this.payload = payload;
    return this;
  }

  async parsePayload<T>(type?: Type<T>): Promise<T> {
    return type
      ? await validatedPlainToClass(type, this.payload)
      : this.payload;
  }

  getPayload(): object {
    return this.payload;
  }

  setHeaders(headers: MessageHeaders): this {
    this.headers = headers;
    return this;
  }

  setHeader(name: string, value: string | number): this {
    this.headers.set(name, value);
    return this;
  }

  removeHeader(name: string): boolean {
    return this.headers.delete(name);
  }

  getHeaders(): MessageHeaders {
    return this.headers;
  }

  getHeader(name: string, defaultValue = ''): string {
    return this.headers.get(name) ?? defaultValue;
  }

  getRequiredHeader(name: string): string {
    const value = this.getHeader(name);
    if (!value) {
      throw new MissingMessageHeaderException(name, this);
    }
    return value;
  }

  hasHeader(name: string): boolean {
    return this.headers.has(name);
  }
}
