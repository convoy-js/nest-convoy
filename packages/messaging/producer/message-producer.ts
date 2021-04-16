import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DiscoveryService, withMetaAtKey } from '@golevelup/nestjs-discovery';

import { RuntimeException } from '@nest-convoy/common';
import {
  ConvoyChannelMapping,
  Message,
  NestMessageInterceptor,
  MissingRequiredMessageIDException,
  NEST_CONVOY_MESSAGE_INTERCEPTOR,
} from '@nest-convoy/messaging/common';

@Injectable()
export abstract class MessageProducer {
  abstract sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent: boolean,
  ): Promise<void>;
  abstract send(
    destination: string,
    message: Message,
    isEvent: boolean,
  ): Promise<void>;
  generateMessageId(): string {
    return uuidv4();
  }
}

@Injectable()
export class ConvoyMessageProducer {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly channelMapping: ConvoyChannelMapping,
    private readonly target: MessageProducer,
    private readonly discovery: DiscoveryService,
  ) {}

  private async getMessageInterceptors(): Promise<
    readonly NestMessageInterceptor[]
  > {
    const providers = await this.discovery.providers(
      withMetaAtKey(NEST_CONVOY_MESSAGE_INTERCEPTOR),
    );

    return providers.map(provider => provider.instance);
  }

  private async preSend(message: Message): Promise<void> {
    for (const interceptor of await this.getMessageInterceptors()) {
      await interceptor.preSend?.(message);
    }
  }

  private async postSend(
    message: Message,
    error?: RuntimeException,
  ): Promise<void> {
    for (const interceptor of await this.getMessageInterceptors()) {
      await interceptor.postSend?.(message, error);
    }
  }

  private prepareMessageHeaders<M extends Message>(
    destination: string,
    message: M,
  ): M {
    const id = this.target.generateMessageId();
    if (!id && !message.hasHeader(Message.ID)) {
      throw new MissingRequiredMessageIDException(message);
    } else {
      // message.setHeader(Message.PARTITION_ID, id);
      message.setHeader(Message.ID, id);
    }

    message.setHeader(
      Message.DESTINATION,
      this.channelMapping.transform(destination),
    );

    return message.setHeader(Message.DATE, new Date().toJSON());
  }

  async sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent = false,
  ): Promise<void> {
    messages = messages.map(message =>
      this.prepareMessageHeaders(destination, message),
    );

    for (const message of messages) {
      await this.preSend(message);
    }

    try {
      this.logger.debug(
        `Sending messages ${messages.map(message =>
          message.toString(),
        )} to destination ${destination}`,
      );
      await this.target.sendBatch(destination, messages, isEvent);
      for (const message of messages) {
        await this.postSend(message);
      }
    } catch (err) {
      this.logger.error(err.message);
      for (const message of messages) {
        await this.postSend(message);
      }
      throw err;
    }
  }

  async send(
    destination: string,
    message: Message,
    isEvent = false,
  ): Promise<void> {
    this.prepareMessageHeaders(destination, message);

    await this.preSend(message);
    try {
      this.logger.debug(
        `Sending message ${message.toString()} to destination ${destination}`,
      );
      await this.target.send(destination, message, isEvent);
      await this.postSend(message);
    } catch (err) {
      this.logger.error(err.message);
      await this.postSend(message, err);
      throw err;
    }
  }
}
