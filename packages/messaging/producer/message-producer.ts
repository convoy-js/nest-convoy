import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { RuntimeException } from '@nest-convoy/core';
import {
  ChannelMapping,
  Message,
  MessageInterceptor,
  NEST_CONVOY_MESSAGE_INTERCEPTORS,
} from '@nest-convoy/messaging/common';

let MESSAGE_ID = 1;

@Injectable()
export abstract class MessageProducer {
  abstract send(message: Message): Promise<void>;
}

@Injectable()
export class InternalMessageProducer {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly channelMapping: ChannelMapping,
    @Optional()
    @Inject(NEST_CONVOY_MESSAGE_INTERCEPTORS)
    private readonly messageInterceptors: MessageInterceptor[],
    @Optional()
    private readonly target: MessageProducer,
  ) {}

  private async preSend(message: Message): Promise<void> {
    for (const interceptor of this.messageInterceptors) {
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
    // const id = this.generateMessageId();
    const id = String(++MESSAGE_ID);
    if (!id && !message.hasHeader(Message.ID)) {
      throw new RuntimeException('Message needs an ID');
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
      await this.target.send(message);
      await this.postSend(message);
    } catch (err) {
      this.logger.error(err.message);
      await this.postSend(message, err);
      throw err;
    }
  }

  /*private preSend(message: Message): Observable<[unknown]> {
    return forkJoin(
      ...this.messageInterceptors.map(x => from(x.preSend?.(message) || of())),
    );
  }

  private postSend(message: Message, error?: RuntimeException) {
    return forkJoin(
      ...this.messageInterceptors.map(x =>
        from(x.postSend?.(message, error) || of()),
      ),
    );
  }

  private send(message: Message) {
    return this.preSend(message).pipe(
      mergeMap(() => this.postSend(message)),
      catchError((error: RuntimeException) => {
        this.logger.error(error.message);
        return this.postSend(message, error).pipe(map(() => throwError(error)));
      }),
    );
  }*/
}
