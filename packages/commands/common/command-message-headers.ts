import { RuntimeException } from '@nest-convoy/common';

export class CommandMessageHeaders {
  static readonly COMMAND_HEADER_PREFIX = 'command_';

  static readonly COMMAND_TYPE =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'type';
  static readonly RESOURCE =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'resource';
  static readonly DESTINATION =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + '_destination';

  static readonly COMMAND_REPLY_PREFIX = 'commandreply_';
  static readonly REPLY_TO =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'reply_to';

  static headerStartsWithCommandPrefix(header: string): boolean {
    return header.startsWith(CommandMessageHeaders.COMMAND_HEADER_PREFIX);
  }

  static inReply(header: string): string {
    if (!this.headerStartsWithCommandPrefix(header)) {
      throw new RuntimeException(
        `Header ${header} must start with: ${CommandMessageHeaders.COMMAND_HEADER_PREFIX}`,
      );
    }

    return (
      CommandMessageHeaders.COMMAND_REPLY_PREFIX +
      header.substring(CommandMessageHeaders.COMMAND_HEADER_PREFIX.length)
    );
  }
}
