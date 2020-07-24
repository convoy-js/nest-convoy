import { CommandMessageHeaders } from '@nest-convoy/commands/common';

export class SagaCommandHeaders {
  static readonly SAGA_TYPE =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'saga_type';
  static readonly SAGA_ID =
    CommandMessageHeaders.COMMAND_HEADER_PREFIX + 'saga_id';
}
