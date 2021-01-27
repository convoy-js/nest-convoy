import { Injectable } from '@nestjs/common';

import { Message, MessageHeaders } from '@nest-convoy/messaging';
import { SagaCommandHeaders } from '@nest-convoy/sagas/common';
import {
  CommandWithDestination,
  ConvoyCommandProducer,
} from '@nest-convoy/commands';

@Injectable()
export class SagaCommandProducer {
  constructor(private readonly commandProducer: ConvoyCommandProducer) {}

  async sendCommands(
    sagaType: string,
    sagaId: string,
    commands: readonly CommandWithDestination[],
    sagaReplyChannel: string,
  ): Promise<string | undefined> {
    let message: Message | undefined;

    for (const command of commands) {
      const headers = new MessageHeaders();
      headers.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);

      message = await this.commandProducer.send(
        command.channel,
        command.command,
        sagaReplyChannel,
        headers,
        command.resource,
      );
    }

    return message?.id;
  }
}
