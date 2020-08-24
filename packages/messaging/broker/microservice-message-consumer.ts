import { Injectable } from '@nestjs/common';
import { Consumer } from '@nest-convoy/common';
import { CommandMessage } from '@nest-convoy/commands';
import { of } from 'rxjs';
import {
  Message,
  MessageBuilder,
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging';

import { ConvoyMicroserviceProxy } from './microservice-proxy';
import {
  createMicroserviceMessage,
  fromMicroserviceMessage,
  MicroserviceMessage,
} from './microservice-message';

@Injectable()
export class MicroserviceMessageConsumer extends MessageConsumer {
  id: string = null;

  constructor(private readonly proxy: ConvoyMicroserviceProxy) {
    super();
  }

  async subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Message, CommandMessage | Message | void>,
    isEventHandler?: boolean,
  ): MessageSubscription {
    const callback = async (data: MicroserviceMessage, ctx: any) => {
      try {
        const handlerMessage = fromMicroserviceMessage(data);
        // TODO: Error handling
        let responseMessage = await handler(handlerMessage, ctx);
        responseMessage =
          responseMessage instanceof CommandMessage
            ? responseMessage.message
            : responseMessage;

        if (!responseMessage) return of();

        const responseData = createMicroserviceMessage(responseMessage);
      } catch (err) {
        console.error(err);
      }
      // return this.proxy.client.send(subscriberId, responseData);
    };

    channels.forEach(channel => {
      this.proxy.server.addHandler(channel, callback, isEventHandler);
    });

    return () => {
      const handlers = this.proxy.server.getHandlers();
      channels.forEach(channel => handlers.delete(channel));
    };
  }

  close(): void {
    this.proxy.server.getHandlers().clear();
  }
}
