import { Logger } from '@nestjs/common';
import { NestConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Dispatcher, RuntimeException } from '@nest-convoy/core';
import {
  MessageBuilder,
  NestConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';
import {
  CommandMessageHeaders,
  Failure,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';

import { CommandHandlers } from './command-handlers';
import { CommandMessage } from './command-message';
import { CommandHandler } from './command-handler';

export class CommandDispatcher implements Dispatcher {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly commandDispatcherId: string,
    protected readonly commandHandlers: CommandHandlers,
    protected readonly messageConsumer: NestConvoyMessageConsumer,
    protected readonly messageProducer: NestConvoyMessageProducer,
  ) {}

  async subscribe(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.commandDispatcherId,
      this.commandHandlers.getChannels(),
      this.handleMessage.bind(this),
    );
  }

  async handleMessage(message: Message): Promise<void> {
    const possibleCommandHandler = this.commandHandlers.findTargetMethod(
      message,
    );
    if (!possibleCommandHandler) {
      throw new RuntimeException(`No method for ${message.id}`);
    }

    const correlationHeaders = this.filterCorrelationHeaders(
      message.getHeaders(),
    );

    const defaultReplyChannel = message.getHeader(
      CommandMessageHeaders.REPLY_TO,
    );

    const payload = this.convertPayload(
      possibleCommandHandler,
      message.getPayload(),
    );

    let replies: Message[];
    try {
      const commandMessage = new CommandMessage(
        message.id,
        payload,
        correlationHeaders,
        message,
      );
      replies = await possibleCommandHandler.invoke(commandMessage);
      this.logger.debug(
        `Generated replies ${this.commandDispatcherId} ${message.constructor.name} ${replies}`,
      );
    } catch (e) {
      this.logger.error(
        `Generated error ${this.commandDispatcherId} ${message} ${e.constructor.name}`,
      );
      await this.handleException(message, defaultReplyChannel);
      return;
    }
    if (Array.isArray(replies)) {
      await this.sendReplies(correlationHeaders, replies, defaultReplyChannel);
    } else {
      this.logger.debug('Null replies - not publishing');
    }
  }

  private async handleException(
    message: Message,
    // commandHandler: CommandHandler,
    defaultReplyChannel?: string,
  ): Promise<void> {
    const reply = MessageBuilder.withPayload(new Failure().toString()).build();
    const correlationHeaders = this.filterCorrelationHeaders(
      message.getHeaders(),
    );
    await this.sendReplies(correlationHeaders, [reply], defaultReplyChannel);
  }

  private convertPayload(ch: CommandHandler, payload: string): any {
    return JSON.parse(payload);
  }

  private async sendReplies(
    correlationHeaders: MessageHeaders,
    replies: Message[],
    defaultReplyChannel?: string,
  ): Promise<void> {
    for (const reply of replies) {
      const message = MessageBuilder.withMessage(reply)
        .withExtraHeaders('', correlationHeaders)
        .build();
      await this.messageProducer.send(defaultReplyChannel, message);
    }
  }

  private filterCorrelationHeaders(headers: MessageHeaders): MessageHeaders {
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
}
