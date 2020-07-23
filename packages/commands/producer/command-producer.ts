import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import {
  MessageBuilder,
  InternalMessageProducer,
} from '@nest-convoy/messaging/producer';

import { Command, CommandMessageHeaders } from '../common';

export interface BaseCommandProducer {
  send(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
  ): Promise<string> | string;
  // send(
  //   channel: string,
  //   resource: string,
  //   command: Command,
  //   replyTo: string,
  //   headers: MessageHeaders,
  // ): string;
}

export class CommandProducer implements BaseCommandProducer {
  constructor(private readonly messageProducer: InternalMessageProducer) {}

  async send(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
  ): Promise<string> {
    const message = this.createMessage(channel, command, replyTo, headers);
    await this.messageProducer.send(channel, message);
    return message.id;
  }

  private createMessage(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
  ): Message {
    const builder = MessageBuilder.withPayload(command.toString())
      .withExtraHeaders('', headers)
      .withHeader(CommandMessageHeaders.DESTINATION, channel)
      .withHeader(CommandMessageHeaders.COMMAND_TYPE, command.constructor.name)
      .withHeader(CommandMessageHeaders.REPLY_TO, replyTo);

    return builder.build();
  }
}
