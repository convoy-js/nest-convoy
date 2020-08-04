import { Injectable } from '@nestjs/common';
import { CommandProducer } from '@nest-convoy/commands/producer';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { MessageHeaders } from '@nest-convoy/messaging/common';
import { SagaCommandHeaders } from '@nest-convoy/saga/common';

@Injectable()
export class SagaCommandProducer {
  constructor(private readonly commandProducer: CommandProducer) {}

  async sendCommands(
    sagaType: string,
    sagaId: string,
    commands: CommandWithDestination[],
    sagaReplyChannel: string,
  ): Promise<string | null> {
    let messageId = null;

    for (const command of commands) {
      const headers: MessageHeaders = new Map(command.extraHeaders);
      headers.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);
      messageId = await this.commandProducer.send(
        command.destinationChannel,
        command.resource,
        command.command,
        sagaReplyChannel,
        headers,
      );
    }

    return messageId;
  }
}
