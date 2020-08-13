import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { RuntimeException } from '@nest-convoy/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ConvoyChannelMapping,
  Message,
  MessageInterceptor,
  MissingRequiredMessageIDException,
  NEST_CONVOY_MESSAGE_INTERCEPTORS,
} from '@nest-convoy/messaging/common';

@Injectable()
export abstract class MessageProducer {
  abstract send(message: Message): Promise<void>;
  generateMessageId(): string {
    return uuidv4();
  }
}

@Injectable()
export class ConvoyMessageProducer {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly channelMapping: ConvoyChannelMapping,
    protected readonly target: MessageProducer,
    @Optional()
    @Inject(NEST_CONVOY_MESSAGE_INTERCEPTORS)
    private readonly messageInterceptors: MessageInterceptor[],
  ) {}

  private async preSend(message: Message): Promise<void> {
    for (const interceptor of this.messageInterceptors || []) {
      await interceptor.preSend?.(message);
    }
  }

  private async postSend(
    message: Message,
    error?: RuntimeException,
  ): Promise<void> {
    for (const interceptor of this.messageInterceptors || []) {
      await interceptor.postSend?.(message, error);
    }
  }

  private prepareMessageHeaders(destination: string, message: Message): void {
    const id = this.target.generateMessageId();
    if (!id && !message.hasHeader(Message.ID)) {
      throw new MissingRequiredMessageIDException(message);
    } else {
      message.setHeader(Message.ID, id);
    }

    message.setHeader(
      Message.DESTINATION,
      this.channelMapping.transform(destination),
    );

    message.setHeader(Message.DATE, new Date().toJSON());
  }

  async send(destination: string, message: Message): Promise<void> {
    this.prepareMessageHeaders(destination, message);

    await this.preSend(message);
    try {
      this.logger.debug(
        `Sending message ${JSON.stringify(message)} to channel ${destination}`,
      );
      await this.target.send(message);
      await this.postSend(message);
    } catch (err) {
      this.logger.error(err.message);
      await this.postSend(message, err);
      throw err;
    }
  }
}
