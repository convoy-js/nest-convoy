import { MessageHeaders } from '@nest-convoy/messaging/common';
import type { Message } from '@nest-convoy/messaging/common';

import { CommandMessageHeaders } from './command-message-headers';
import { ReplyMessageHeaders } from './reply-message-headers';

export function correlateMessageHeaders(message: Message): MessageHeaders {
  const correlationHeaders = new MessageHeaders(
    [...message.getHeaders().entries()]
      .filter(([key]) =>
        CommandMessageHeaders.headerStartsWithCommandPrefix(key),
      )
      .map(([key, value]) => [CommandMessageHeaders.inReply(key), value]),
  );

  correlationHeaders.set(ReplyMessageHeaders.IN_REPLY_TO, message.id);

  return correlationHeaders;
}
