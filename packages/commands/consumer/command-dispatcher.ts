import { Logger } from '@nestjs/common';

import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Dispatcher } from '@nest-convoy/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';
import {
  CommandMessageHeaders,
  correlateMessageHeaders,
  Failure,
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
    // commandHandler: CommandHandler,
    defaultReplyChannel: string,
    // error: Error,
  ): Promise<void> {
    const reply = MessageBuilder.withPayload(new Failure()).build();
    const correlationHeaders = correlateMessageHeaders(message.getHeaders());
    await this.sendReplies(correlationHeaders, [reply], defaultReplyChannel);
  }

  private async sendReplies(
    correlationHeaders: MessageHeaders,
    replies: Message[],
    defaultReplyChannel: string,
  ): Promise<void> {
    for (const reply of replies) {
      const message = MessageBuilder.withMessage(reply)
        .withExtraHeaders(correlationHeaders)
        .build();

      await this.messageProducer.send(defaultReplyChannel, message);
    }
  }

  protected async invoke(
    commandHandler: CommandHandler,
    commandMessage: CommandMessage,
  ): Promise<Message[]> {
    // TODO: Figure out whether or not it should sendReplies or handleException
    try {
      const reply = await commandHandler.invoke(commandMessage);
      return Array.isArray(reply)
        ? reply.map(r => (r instanceof Message ? r : withSuccess(r)))
        : reply instanceof Message
        ? [reply]
        : [
            commandHandler.options.withLock
              ? withLock(commandMessage.command).withSuccess(reply)
              : withSuccess(reply),
          ];
    } catch (err) {
      return [withFailure(err)];
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

    const correlationHeaders = correlateMessageHeaders(message.getHeaders());

    const defaultReplyChannel = message.getRequiredHeader(
      CommandMessageHeaders.REPLY_TO,
    );

    let replies: Message[];
    try {
      const command = Object.assign(
        new commandHandler.command(),
        message.parsePayload(),
      );

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
      this.logger.error(
        `Generated error ${this.commandDispatcherId} ${message.toString()}`,
      );
      await this.handleException(message, defaultReplyChannel /*, err*/);
      return;
    }

    if (Array.isArray(replies)) {
      await this.sendReplies(correlationHeaders, replies, defaultReplyChannel);
    } else {
      this.logger.debug('Null replies - not publishing');
    }
  }
}
