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

    // return new Promise((complete, error) => {
    if (isEvent) {
      this.proxy
        .client!.emit(destination, data)
        .pipe(timeout(1000), retry(2))
        .subscribe(/*{
            next: value => console.log(value),
            error,
            complete,
          }*/);
    } else {
      this.proxy
        .client!.send(destination, data)
        .pipe(timeout(1000), retry(2))
        .subscribe(/*{
            next: value => console.log(value),
            error,
            complete,
          }*/);
    }
    // });
  }
}
