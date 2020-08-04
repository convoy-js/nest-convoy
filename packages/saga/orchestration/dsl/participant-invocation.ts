import { Message } from '@nest-convoy/messaging/common';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { Predicate } from '@nest-convoy/core';
import {
  Command,
  CommandProvider,
  CommandReplyOutcome,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';

import { CommandEndpoint } from './command-endpoint';

export abstract class BaseParticipantInvocation<Data> {
  abstract createCommandToSend(data: Data): CommandWithDestination;
  isInvocable?: Predicate<Data>;
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
      CommandWithDestination
    >,
    readonly isInvocable?: Predicate<Data>,
  ) {
    super();
  }

  createCommandToSend(data: Data): CommandWithDestination {
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

  createCommandToSend(data: Data): CommandWithDestination {
    return new CommandWithDestination(
      this.commandEndpoint.commandChannel,
      this.commandProvider(data),
      null,
    );
  }
}
