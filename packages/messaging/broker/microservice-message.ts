import { Message, MessageBuilder } from '@nest-convoy/messaging';

export interface MicroserviceMessage {
  key: string;
  value: string;
  headers: Record<string, string>;
}

export function createMicroserviceMessage(
  message: Message,
): MicroserviceMessage {
  return {
    key: message.id,
    value: message.getPayload(),
    headers: Object.fromEntries(message.getHeaders().entries()),
  };
}

export function fromMicroserviceMessage(data: MicroserviceMessage): Message {
  return MessageBuilder.withPayload(data.value)
    .withHeader(Message.ID, data.key)
    .withExtraHeaders('', new Map(Object.entries(data.headers)))
    .build();
}
