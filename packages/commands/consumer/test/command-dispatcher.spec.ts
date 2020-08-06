import { Test } from '@nestjs/testing';
import { Message } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';
import {
  ConvoyCommandsProducerModule,
  ConvoyCommandProducer,
} from '@nest-convoy/commands/producer';
import {
  CommandDispatcher,
  CommandDispatcherFactory,
  CommandHandler,
  CommandHandlers,
  ConvoyCommandsConsumerModule,
} from '@nest-convoy/commands/consumer';

describe('CommandDispatcher', () => {
  let commandDispatcherFactory: CommandDispatcherFactory;
  let commandProducer: ConvoyCommandProducer;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConvoyCommandsConsumerModule, ConvoyCommandsProducerModule],
    }).compile();

    commandDispatcherFactory = moduleRef.get(CommandDispatcherFactory);
    commandProducer = moduleRef.get(ConvoyCommandProducer);
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
