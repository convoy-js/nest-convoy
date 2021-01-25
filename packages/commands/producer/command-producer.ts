import { Injectable, Type } from '@nestjs/common';

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
}

@Injectable()
export class ConvoyCommandProducer extends CommandProducer {
  constructor(private readonly messageProducer: ConvoyMessageProducer) {
    super();
  }

  createMessage(
    channel: string,
    command: Command,
    replyTo: string,
    headers: MessageHeaders,
    resource?: string,
  ): Message {
    const builder = MessageBuilder.withPayload(command)
      .withReference(command)
      .withExtraHeaders(headers)
      .withHeader(CommandMessageHeaders.DESTINATION, channel)
      .withHeader(CommandMessageHeaders.COMMAND_TYPE, command.constructor.name)
      .withHeader(CommandMessageHeaders.REPLY_TO, replyTo);

    if (resource != null) {
      builder.withHeader(CommandMessageHeaders.RESOURCE, resource);
    }

    return builder.build();
  }

  async sendBatch(channel: string, commands: Command[]): Promise<string[]> {
    return [];
  }

  async send(
    channel: string,
    command: Command,
    replyTo: string,
    headers = new MessageHeaders(),
    resource?: string,
  ): Promise<string> {
    const message = this.createMessage(
      channel,
      command,
      replyTo,
      headers,
      resource,
    );
    const destination = channel; /*`${channel}-${message.getRequiredHeader(
      CommandMessageHeaders.COMMAND_TYPE,
    )}`*/
    await this.messageProducer.send(destination, message);
    return message.id;
  }
}
