import { Injectable } from '@nestjs/common';
import { Consumer } from '@nest-convoy/core';
import { CommandMessage } from '@nest-convoy/commands';
import { of } from 'rxjs';
import {
  Message,
  MessageBuilder,
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging';

import { MicroserviceProxy } from './microservice-proxy';
import {
  createMicroserviceMessage,
  fromMicroserviceMessage,
} from '@nest-convoy/messaging/broker/microservice-message';

@Injectable()
export class MicroserviceMessageConsumer extends MessageConsumer {
  id: string = null;

  constructor(private readonly proxy: MicroserviceProxy) {
    super();
  }

  async subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Message, CommandMessage | Message>,
    isEventHandler?: boolean,
  ): MessageSubscription {
    const callback = async (data: any, ctx: any) => {
      const handlerMessage = fromMicroserviceMessage(data);
      // TODO: Error handling
      let responseMessage = await handler(handlerMessage, ctx);
      responseMessage =
        responseMessage instanceof CommandMessage
          ? responseMessage.message
          : responseMessage;

      if (!responseMessage) return of();

      const responseData = createMicroserviceMessage(responseMessage);
      return this.proxy.client.send(subscriberId, responseData);
    };

    channels.forEach(channel => {
      this.proxy.server.addHandler(channel, callback, isEventHandler);
    });

    return () => {
      channels.forEach(channel =>
        this.proxy.server.getHandlers().delete(channel),
      );
    };
  }

  close(): void {
    this.proxy.server.getHandlers().clear();
  }
}
