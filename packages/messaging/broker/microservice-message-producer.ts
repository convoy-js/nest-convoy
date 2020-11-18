import { Injectable } from '@nestjs/common';
import { retry, timeout } from 'rxjs/operators';

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
    const produce$ = isEvent
      ? this.proxy.client!.emit(destination, data)
      : this.proxy.client!.send(destination, data);

    produce$
      .pipe(timeout(this.proxy.timeout), retry(this.proxy.retries))
      .subscribe(/*{
            next: value => console.log(value),
            error,
            complete,
          }*/);
  }
}
