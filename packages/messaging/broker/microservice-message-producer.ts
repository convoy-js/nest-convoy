import { Injectable } from '@nestjs/common';

import { Message, MessageProducer } from '@nest-convoy/messaging';

import { ConvoyMicroserviceProxy } from './microservice-proxy';
import { createMicroserviceMessage } from './microservice-message';

@Injectable()
export class MicroserviceMessageProducer extends MessageProducer {
  constructor(private readonly proxy: ConvoyMicroserviceProxy) {
    super();
  }

  async send(
    destination: string,
    message: Message,
    isEvent: boolean,
  ): Promise<void> {
    const data = createMicroserviceMessage(message);

    if (isEvent) {
      this.proxy.client!.emit(destination, data).subscribe();
    } else {
      this.proxy.client!.send(destination, data).subscribe();
    }
  }
}
