export type MessageRecordHeaders = Record<string, string>;

export class MessageHeaders extends Map<string, string> {
  static fromRecord(headers: MessageRecordHeaders): MessageHeaders {
    return new MessageHeaders(Object.entries(headers));
  }

  asRecord(): MessageRecordHeaders {
    return Object.fromEntries(this);
  }
}
