import { Message, MessageHeaders } from '@nest-convoy/messaging/common';

import { CommandMessageHeaders } from './command-message-headers';
import { ReplyMessageHeaders } from './reply-message-headers';

export function correlateMessageHeaders(
  headers: MessageHeaders,
): MessageHeaders {
  const correlationHeaders = new Map(
    [...headers.entries()]
      .filter(([key]) =>
        CommandMessageHeaders.headerStartsWithCommandPrefix(key),
      )
      .map(([key, value]) => [CommandMessageHeaders.inReply(key), value]),
  );

  correlationHeaders.set(
    ReplyMessageHeaders.IN_REPLY_TO,
    headers.get(Message.ID),
  );

  return correlationHeaders;
}
