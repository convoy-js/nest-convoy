import { Injectable } from '@nestjs/common';
import { Message, MessageProducer } from '@nest-convoy/messaging';

import { MicroserviceProxy } from './microservice-proxy';
import { createMicroserviceMessage } from './microservice-message';

@Injectable()
export class MicroserviceMessageProducer extends MessageProducer {
  constructor(private readonly proxy: MicroserviceProxy) {
    super();
  }

  async send(message: Message): Promise<void> {
    const destination = message.getRequiredHeader(Message.DESTINATION);
    const data = createMicroserviceMessage(message);
    // TODO: Check if message is an event, because then we simply use emit
    await this.proxy.client.emit(destination, data).toPromise();
  }
}
