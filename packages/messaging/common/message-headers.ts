export type MessageRecordHeaders = Record<string, string>;

export class MessageHeaders extends Map<string, string> {
  static fromRecord(headers: MessageRecordHeaders): MessageHeaders {
    return new MessageHeaders(Object.entries(headers));
  }

  set(key: string, value: string | number): this {
    super.set(key, String(value));
    return this;
  }

  asRecord(): MessageRecordHeaders {
    return Object.fromEntries(this);
  }
}
