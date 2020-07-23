import { Injectable } from '@nestjs/common';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import {
  MessageBuilder,
  InternalMessageProducer,
} from '@nest-convoy/messaging/producer';
import { Command, CommandMessageHeaders } from '@nest-convoy/commands/common';

@Injectable()
export abstract class CommandProducer {
  constructor(protected readonly messageProducer: InternalMessageProducer) {}

  abstract send(
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

@Injectable()
export class InternalCommandProducer extends CommandProducer {
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
}
