import { Injectable } from '@nestjs/common';
import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Command, CommandMessageHeaders } from '@nest-convoy/commands/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
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
export class ConvoyCommandProducer implements CommandProducer {
  constructor(private readonly messageProducer: ConvoyMessageProducer) {}

  createMessage(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
    resource?: string,
  ): Message {
    const builder = MessageBuilder.withPayload(command)
      .withExtraHeaders('', headers)
      .withHeader(CommandMessageHeaders.DESTINATION, channel)
      .withHeader(CommandMessageHeaders.COMMAND_TYPE, command.constructor.name)
      .withHeader(CommandMessageHeaders.REPLY_TO, replyTo);

    if (resource != null) {
      builder.withHeader(CommandMessageHeaders.RESOURCE, resource);
    }

    return builder.build();
  }

  async send(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders = new Map(),
    resource?: string,
  ): Promise<string> {
    const message = this.createMessage(
      channel,
      command,
      replyTo,
      headers,
      resource,
    );
    await this.messageProducer.send(channel, message);
    return message.id;
  }
}
