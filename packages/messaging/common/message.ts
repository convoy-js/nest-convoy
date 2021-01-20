import { MissingMessageHeaderException } from './exceptions';
import { MessageHeaders } from './message-headers';

export class Message {
  static ID = 'id';
  static PARTITION = 'partition';
  static DESTINATION = 'destination';
  static DATE = 'date';

  get id(): string {
    return this.getRequiredHeader(Message.ID);
  }

  get partition(): number {
    return +this.getRequiredHeader(Message.PARTITION);
  }

  constructor(
    private payload: string,
    private headers = new MessageHeaders(),
  ) {}

  toString(): string {
    return JSON.stringify({
      payload: this.payload,
      headers: this.getHeaders().asRecord(),
    });
  }

  setPayload(payload: string): this {
    this.payload = payload;
    return this;
  }

  parsePayload<T = any>(): T {
    return JSON.parse(this.payload) as T;
  }

  getPayload(): string {
    return this.payload;
  }

  setHeaders(headers: MessageHeaders): this {
    this.headers = headers;
    return this;
  }

  setHeader(name: string, value: string): this {
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
