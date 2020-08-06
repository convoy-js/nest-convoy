import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export type MessageHeaders = Map<string, string>;

export type MessageHandler = (data: Message) => Promise<void> | void;

export class Message {
  static ID = 'id';
  static PARTITION_ID = 'partition_id';
  static DESTINATION = 'destination';
  static DATE = 'date';

  get id(): string {
    return this.getRequiredHeader(Message.ID);
  }

  constructor(private payload: string, private headers: MessageHeaders) {}

  setPayload(payload: string): void {
    this.payload = payload;
  }

  parsePayload<T = any>(): T {
    return JSON.parse(this.payload);
  }

  getPayload(): string {
    return this.payload;
  }

  setHeaders(headers: MessageHeaders): void {
    this.headers = headers;
  }

  setHeader(name: string, value: string): void {
    if (!this.headers) {
      this.headers = new Map();
    }
    this.headers.set(name, value);
  }

  removeHeader(name: string): boolean {
    return this.headers.delete(name);
  }

  getHeaders(): MessageHeaders {
    return this.headers;
  }

  getHeader(name: string): string {
    return this.headers.get(name);
  }

  getRequiredHeader(name: string): string {
    const value = this.getHeader(name);
    if (!value) {
      throw new RuntimeException(
        `No such header: ${name} in this message - ${this}`,
      );
    }
    return value;
  }

  hasHeader(name: string): boolean {
    return this.headers.has(name);
  }
}
