import { RuntimeException } from '@nest-convoy/core';

export class CommandMessageHeaders {
  static COMMAND_HEADER_PREFIX = 'command_';

  static COMMAND_TYPE = CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'type';
  static RESOURCE = CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'resource';
  static DESTINATION =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + '_destination';

  static COMMAND_REPLY_PREFIX = 'commandreply_';
  static REPLY_TO = CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'reply_to';

  static headerStartsWithCommandPrefix(header: string): boolean {
    return header.startsWith(CommandMessageHeaders.COMMAND_HEADER_PREFIX);
  }

  static inReply(header: string): string {
    if (!this.headerStartsWithCommandPrefix(header)) {
      throw new RuntimeException(
        `Header: ${header} must start with: ${CommandMessageHeaders.COMMAND_HEADER_PREFIX}`,
      );
    }

    return (
      CommandMessageHeaders.COMMAND_REPLY_PREFIX +
      header.substring(CommandMessageHeaders.COMMAND_HEADER_PREFIX.length)
    );
  }
}
