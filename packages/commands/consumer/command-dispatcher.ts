import { Logger } from '@nestjs/common';

import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Dispatcher, RuntimeException } from '@nest-convoy/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';
import {
  CommandMessageHeaders,
  correlateMessageHeaders,
  MissingCommandHandlerException,
} from '@nest-convoy/commands/common';

import { CommandHandlers } from './command-handlers';
import { CommandMessage } from './command-message';
import { CommandHandler } from './command-handler';
import { withFailure, withSuccess } from './command-handler-reply-builder';
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
    const correlationHeaders = correlateMessageHeaders(message.getHeaders());
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
    // TODO: Figure out whether or not it should sendReplies or handleException
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
      // if (!(err instanceof RuntimeException)) {
      //   throw err;
      // }
      // rules_nodejs doesn't have 15.0.0+ version
      return [err].map(reply =>
        commandHandler.options.withLock
          ? withLock(commandMessage.command).withFailure(reply)
          : withFailure(reply),
      );
      // const errors = err instanceof AggregateError ? err.errors : [err];
      // return errors.map(reply =>
      //   commandHandler.options.withLock
      //     ? withLock(commandMessage.command).withFailure(reply)
      //     : withFailure(reply),
      // );
    }
  }

  async subscribe(): Promise<void> {
    // await Promise.all(
    //   this.commandHandlers.getHandlers().map(async handler => {
    //     await this.messageConsumer.subscribe(
    //       this.commandDispatcherId,
    //       [handler.channel], // [`${handler.channel}-${handler.command.name}`],
    //       this.handleMessage.bind(this),
    //     );
    //   }),
    // );

    // TODO: We need a generic subscriber for channel ONLY, in case of multiple messages being sent to the same destination
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

    const correlationHeaders = correlateMessageHeaders(message.getHeaders());

    const defaultReplyChannel = message.getRequiredHeader(
      CommandMessageHeaders.REPLY_TO,
    );

    let replies: readonly Message[];
    try {
      const command = message.parsePayload(commandHandler.command);

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
      // TODO: This will never be called (unless payload cannot be parsed) as "invoke" handles errors as well
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
