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
    commands: readonly CommandWithDestination[],
    sagaReplyChannel: string,
  ): Promise<string | undefined> {
    let messageId: string | undefined;

    // commands = commands.map(command => {
    //   const headers = new MessageHeaders();
    //   headers.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
    //   headers.set(SagaCommandHeaders.SAGA_ID, sagaId);
    //   command.withExtraHeaders(headers);
    //
    //   return command;
    // });
    //
    // await this.commandProducer.sendBatch()

    for (const command of commands) {
      const headers = new MessageHeaders();
      headers.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);

      messageId = await this.commandProducer.send(
        command.channel,
        command.command,
        sagaReplyChannel,
        headers,
        command.resource,
      );
    }

    return messageId;
  }
}
