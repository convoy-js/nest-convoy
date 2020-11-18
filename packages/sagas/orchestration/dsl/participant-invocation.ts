import { Message } from '@nest-convoy/messaging/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Predicate } from '@nest-convoy/common';
import {
  Command,
  CommandProvider,
  CommandReplyOutcome,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';

import { CommandEndpoint } from './command-endpoint';

export abstract class BaseParticipantInvocation<Data> {
  readonly isInvocable?: Predicate<Data>;
  abstract createCommandToSend(data: Data): Promise<CommandWithDestination>;
  isSuccessfulReply(message: Message): boolean {
    return (
      CommandReplyOutcome.SUCCESS ===
      message.getRequiredHeader(ReplyMessageHeaders.REPLY_OUTCOME)
    );
  }
}

export class ParticipantInvocation<
  Data,
  C extends Command
> extends BaseParticipantInvocation<Data> {
  constructor(
    private readonly commandBuilder: CommandProvider<
      Data,
      CommandWithDestination<C>
    >,
    readonly isInvocable?: Predicate<Data>,
  ) {
    super();
  }

  async createCommandToSend(data: Data): Promise<CommandWithDestination> {
    return this.commandBuilder(data);
  }
}

export class ParticipantEndpointInvocation<
  Data,
  C extends Command
> extends BaseParticipantInvocation<Data> {
  constructor(
    private readonly commandEndpoint: CommandEndpoint<C>,
    private readonly commandProvider: CommandProvider<Data, C>,
    readonly isInvocable?: Predicate<Data>,
  ) {
    super();
  }

  async createCommandToSend(data: Data): Promise<CommandWithDestination> {
    return new CommandWithDestination(
      this.commandEndpoint.channel,
      await this.commandProvider(data),
    );
  }
}
