import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { InternalMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';
import {
  CommandsProducerModule,
  InternalCommandProducer,
} from '@nest-convoy/commands/producer';
import {
  CommandDispatcher,
  CommandDispatcherFactory,
  CommandHandler,
  CommandHandlers,
  CommandsConsumerModule,
} from '@nest-convoy/commands/consumer';

describe('CommandDispatcher', () => {
  let commandDispatcherFactory: CommandDispatcherFactory;
  let commandProducer: InternalCommandProducer;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CommandsConsumerModule, CommandsProducerModule],
    })
      .overrideProvider(InternalMessageConsumer)
      .useValue({
        subscribe: jest.fn().mockImplementation(() => of().subscribe()),
      })
      .compile();

    commandDispatcherFactory = moduleRef.get(CommandDispatcherFactory);
    commandProducer = moduleRef.get(InternalCommandProducer);
  });

  it('handleMessage', async () => {
    const commandDispatcherId = 'foo';
    const channel = 'test';
    const handler = jest.fn();
    const replyTo = 'replyTo-xxx';

    class TestCommand implements Command {
      constructor(readonly hello: string) {}
    }

    const commandHandler = new CommandHandler(channel, TestCommand, handler);
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
