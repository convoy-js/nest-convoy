import { MissingMessageHeaderException } from './exceptions';
import type { MessageRecordHeaders, MessageHeaders } from './types';

export class Message {
  static ID = 'id';
  static PARTITION_ID = 'partition_id';
  static DESTINATION = 'destination';
  static DATE = 'date';

  get id(): string {
    return this.getRequiredHeader(Message.ID);
  }

  constructor(private payload: string, private headers: MessageHeaders) {}

  toString(): string {
    return JSON.stringify({
      payload: this.payload,
      headers: this.getHeadersAsRecord(),
    });
  }

  setPayload(payload: string): this {
    this.payload = payload;
    return this;
  }

  parsePayload<T = any>(): T {
    return JSON.parse(this.payload);
  }

  getPayload(): string {
    return this.payload;
  }

  setHeaders(headers: MessageHeaders): this {
    this.headers = headers;
    return this;
  }

  setHeader(name: string, value: string | number): this {
    if (!this.headers) {
      this.headers = new Map();
    }
    this.headers.set(name, String(value));
    return this;
  }

  removeHeader(name: string): boolean {
    return this.headers.delete(name);
  }

  getHeadersAsRecord(): MessageRecordHeaders {
    return Object.fromEntries(this.getHeaders().entries());
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
