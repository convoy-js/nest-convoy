import { Injectable } from '@nestjs/common';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Command, CommandMessageHeaders } from '@nest-convoy/commands/common';
import {
  MessageBuilder,
  NestConvoyMessageProducer,
  MessageProducer,
} from '@nest-convoy/messaging/producer';

@Injectable()
export abstract class CommandProducer {
  abstract send(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
    resource?: string,
  ): Promise<string> | string;
  // send(
  //   channel: string,
  //   resource: string,
  //   command: Command,
  //   replyTo: string,
  //   headers: MessageHeaders,
  // ): string;
}

@Injectable()
export class NestConvoyCommandProducer implements CommandProducer {
  constructor(private readonly messageProducer: NestConvoyMessageProducer) {}

  createMessage(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
  ): Message {
    const builder = MessageBuilder.withPayload(JSON.stringify(command))
      .withExtraHeaders('', headers)
      .withHeader(CommandMessageHeaders.DESTINATION, channel)
      .withHeader(CommandMessageHeaders.COMMAND_TYPE, command.constructor.name)
      .withHeader(CommandMessageHeaders.REPLY_TO, replyTo);

    return builder.build();
  }

  async send(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders = new Map(),
    resource?: string,
  ): Promise<string> {
    const message = this.createMessage(channel, command, replyTo, headers);
    await this.messageProducer.send(channel, message);
    return message.id;
  }
}
