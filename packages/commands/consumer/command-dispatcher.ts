import { Logger } from '@nestjs/common';

import {
  CommandMessageHeaders,
  correlateMessageHeaders,
  MissingCommandHandlerException,
} from '@nest-convoy/commands/common';
import type { Dispatcher } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';
import type { MessageHeaders } from '@nest-convoy/messaging/common';
import type { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import type { ConvoyMessageProducer } from '@nest-convoy/messaging/producer';
import { MessageBuilder } from '@nest-convoy/messaging/producer';

import type { CommandHandler } from './command-handler';
import { withFailure, withSuccess } from './command-handler-reply-builder';
import type { CommandHandlers } from './command-handlers';
import { CommandMessage } from './command-message';
import { withLock } from './saga-reply-lock';

export class ConvoyCommandDispatcher implements Dispatcher {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    protected readonly commandDispatcherId: string,
    protected readonly commandHandlers: CommandHandlers,
    protected readonly messageConsumer: ConvoyMessageConsumer,
    protected readonly messageProducer: ConvoyMessageProducer,
  ) {}

  private async handleException(
    message: Message,
    defaultReplyChannel: string,
    error: Error,
  ): Promise<void> {
    const reply = withFailure(error);
    const correlationHeaders = correlateMessageHeaders(message);
    await this.sendReplies(correlationHeaders, [reply], defaultReplyChannel);
  }

  private async sendReplies(
    correlationHeaders: MessageHeaders,
    replies: readonly Message[],
    defaultReplyChannel: string,
  ): Promise<void> {
    const messages = replies.map(reply =>
      MessageBuilder.withMessage(reply)
        .withExtraHeaders(correlationHeaders)
        .build(),
    );

    await this.messageProducer.sendBatch(defaultReplyChannel, messages);
  }

  protected async invoke(
    commandHandler: CommandHandler,
    commandMessage: CommandMessage,
  ): Promise<readonly Message[]> {
    try {
      const result = await commandHandler.invoke(commandMessage);
      const replies = Array.isArray(result) ? result : [result];
      return replies.map(reply =>
        reply instanceof Message
          ? reply
          : commandHandler.options.withLock
          ? withLock(commandMessage.command).withSuccess(reply)
          : withSuccess(reply),
      );
    } catch (err) {
      // rules_nodejs doesn't have 15.0.0+ version
      // const errors = err instanceof AggregateError ? err.errors : [err];
      // return errors.map(reply =>
      //   commandHandler.options.withLock
      //     ? withLock(commandMessage.command).withFailure(reply)
      //     : withFailure(reply),
      // );
      return [err].map(reply =>
        commandHandler.options.withLock
          ? withLock(commandMessage.command).withFailure(reply)
          : withFailure(reply),
      );
    }
  }

  async subscribe(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.commandDispatcherId,
      this.commandHandlers.getChannels(),
      this.handleMessage.bind(this),
    );
  }

  async handleMessage(message: Message): Promise<void> {
    const commandHandler = this.commandHandlers.findTargetMethod(message);
    if (!commandHandler) {
      throw new MissingCommandHandlerException(message);
    }

    const correlationHeaders = correlateMessageHeaders(message);
    const defaultReplyChannel = message.getRequiredHeader(
      CommandMessageHeaders.REPLY_TO,
    );

    let replies: readonly Message[];
    try {
      const command = await message.parsePayload(commandHandler.command);

      const commandMessage = new CommandMessage(
        command,
        correlationHeaders,
        message,
      );
      replies = await this.invoke(commandHandler, commandMessage);
      this.logger.debug(
        `Generated replies ${commandHandler.command.name} ${
          message.constructor.name
        } ${replies.map(reply => reply.toString())}`,
      );
    } catch (err) {
      // TODO: This should never be executed (unless payload cannot be parsed), as "invoke" handles errors as well
      this.logger.error(
        `Generated error ${this.commandDispatcherId} ${message.toString()}`,
      );
      await this.handleException(message, defaultReplyChannel, err);
      return;
    }

    if (Array.isArray(replies)) {
      await this.sendReplies(correlationHeaders, replies, defaultReplyChannel);
    } else {
      this.logger.debug('Null replies - not publishing');
    }
  }
}
