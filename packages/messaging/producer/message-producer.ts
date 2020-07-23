import { Inject, Injectable, Logger } from '@nestjs/common';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

import {
  ChannelMapping,
  Message,
  MessageInterceptor,
  NEST_CONVOY_MESSAGE_INTERCEPTORS,
} from '../common';

let MESSAGE_ID = 1;

@Injectable()
export class MessageProducer {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly channelMapping: ChannelMapping,
    @Inject(NEST_CONVOY_MESSAGE_INTERCEPTORS)
    private readonly messageInterceptors: MessageInterceptor[],
  ) {}

  private preSend(message: Message): Promise<void[]> {
    return Promise.all(this.messageInterceptors.map(x => x.preSend?.(message)));
  }

  private postSend(
    message: Message,
    error?: RuntimeException,
  ): Promise<void[]> {
    return Promise.all(
      this.messageInterceptors.map(x => x.postSend?.(message, error)),
    );
  }

  private prepareMessageHeaders(destination: string, message: Message): void {
    // const id = this.generateMessageId();
    const id = String(++MESSAGE_ID);
    if (!id && !message.hasHeader(Message.ID)) {
      throw new Error('Message needs an ID');
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
      // await this.send();
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
