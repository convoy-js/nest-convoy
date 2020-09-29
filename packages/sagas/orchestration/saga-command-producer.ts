import { Injectable } from '@nestjs/common';

import { MessageHeaders } from '@nest-convoy/messaging';
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
    commands: CommandWithDestination[],
    sagaReplyChannel: string,
  ): Promise<string | undefined> {
    let messageId: string | undefined;

    for (const command of commands) {
      const headers: MessageHeaders = new Map(command.extraHeaders);
      headers.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);

      messageId = await this.commandProducer.send(
        command.destinationChannel,
        command.command,
        sagaReplyChannel,
        headers,
        command.resource,
      );
    }

    return messageId;
  }
}
