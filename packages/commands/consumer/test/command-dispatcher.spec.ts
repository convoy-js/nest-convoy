import { Test } from '@nestjs/testing';
import { Message } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';
import {
  NestConvoyCommandsProducerModule,
  NestConvoyCommandProducer,
} from '@nest-convoy/commands/producer';
import {
  CommandDispatcher,
  CommandDispatcherFactory,
  CommandHandler,
  CommandHandlers,
  NestConvoyCommandsConsumerModule,
} from '@nest-convoy/commands/consumer';

describe('CommandDispatcher', () => {
  let commandDispatcherFactory: CommandDispatcherFactory;
  let commandProducer: NestConvoyCommandProducer;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        NestConvoyCommandsConsumerModule,
        NestConvoyCommandsProducerModule,
      ],
    }).compile();

    commandDispatcherFactory = moduleRef.get(CommandDispatcherFactory);
    commandProducer = moduleRef.get(NestConvoyCommandProducer);
  });

  it('handleMessage', async () => {
    const commandDispatcherId = 'foo';
    const channel = 'test';
    const handler = jest.fn();
    const replyTo = 'replyTo-xxx';

    class TestCommand implements Command {
      constructor(readonly hello: string) {}
    }

    const commandHandler = new CommandHandler(
      channel,
      undefined,
      TestCommand,
      handler,
    );
    const commandHandlers = new CommandHandlers([commandHandler]);
    const commandDispatcher = commandDispatcherFactory.create(
      commandDispatcherId,
      commandHandlers,
    );
    const message = commandProducer.createMessage(
      channel,
      new TestCommand('world'),
      replyTo,
      new Map([[Message.ID, '999']]),
    );
    await commandDispatcher.handleMessage(message);
    throw '';
  });
});
