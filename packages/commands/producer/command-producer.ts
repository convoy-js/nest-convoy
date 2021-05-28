import { Injectable } from '@nestjs/common';

import type { Command } from '@nest-convoy/commands/common';
import { CommandMessageHeaders } from '@nest-convoy/commands/common';
import type { Message } from '@nest-convoy/messaging/common';
import { MessageHeaders } from '@nest-convoy/messaging/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';

@Injectable()
export class ConvoyCommandProducer {
  constructor(private readonly messageProducer: ConvoyMessageProducer) {}

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

    if (resource) {
      builder.withHeader(CommandMessageHeaders.RESOURCE, resource);
    }

    return builder.build();
  }

  async sendBatch(
    channel: string,
    commands: Command[],
    replyTo: string,
    headers = new MessageHeaders(),
    resource?: string,
  ): Promise<readonly Message[]> {
    const messages = commands.map(cmd =>
      this.createMessage(channel, cmd, replyTo, headers, resource),
    );
    const destination = channel; /*`${channel}-${message.getRequiredHeader(
      CommandMessageHeaders.COMMAND_TYPE,
    )}`*/
    await this.messageProducer.sendBatch(destination, messages);
    return messages;
  }

  async send(
    channel: string,
    command: Command,
    replyTo: string,
    headers = new MessageHeaders(),
    resource?: string,
  ): Promise<Message> {
    const [message] = await this.sendBatch(
      channel,
      [command],
      replyTo,
      headers,
      resource,
    );
    return message;
  }
}
