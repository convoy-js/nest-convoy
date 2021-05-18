import { EntityProperty, Platform, Type } from '@mikro-orm/core';

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

export class MessageHeadersType extends Type<
  MessageHeaders,
  MessageRecordHeaders
> {
  getColumnType(prop: EntityProperty, platform: Platform): string {
    return platform.getJsonDeclarationSQL();
  }

  convertToDatabaseValue(value: MessageHeaders): MessageRecordHeaders {
    return value.asRecord();
  }

  convertToJSValue(value: MessageRecordHeaders): MessageHeaders {
    return MessageHeaders.fromRecord(value);
  }
}
