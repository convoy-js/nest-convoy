import { Injectable } from '@nestjs/common';
import { ICommandBus } from '@nestjs/cqrs';
import { Command, ConvoyCommandProducer } from '@nest-convoy/commands';
import { ConvoyMessageConsumer, Message } from '@nest-convoy/messaging';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CommandBus implements ICommandBus {
  constructor(
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: ConvoyMessageConsumer,
  ) {}

  execute<T extends Command>(
    command: T,
    commandChannel = uuidv4(),
    replyChannel = uuidv4(),
    subscriberId = uuidv4(),
  ): Promise<Message> {
    return new Promise(async resolve => {
      await this.messageConsumer.subscribe(
        subscriberId,
        [replyChannel],
        resolve,
      );

      const commandId = await this.commandProducer.send(
        command.constructor.name,
        command,
        replyChannel,
      );
    });
  }
}
