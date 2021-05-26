import { Injectable } from '@nestjs/common';

import type { CommandWithDestination } from '@nest-convoy/commands';
import { ConvoyCommandProducer } from '@nest-convoy/commands';
import type { Message } from '@nest-convoy/messaging';
import { SagaMessageHeaders } from '@nest-convoy/sagas/common';

@Injectable()
export class SagaCommandProducer {
  constructor(private readonly commandProducer: ConvoyCommandProducer) {}

  // TODO: Kafka transactions
  async sendCommands(
    sagaType: string,
    sagaId: string,
    commands: readonly CommandWithDestination[],
    sagaReplyChannel: string,
  ): Promise<string | undefined> {
    let message: Message | undefined;

    for (const command of commands) {
      const headers = new SagaMessageHeaders(sagaType, sagaId);

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
