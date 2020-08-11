import { Test } from '@nestjs/testing';
import { mockProvider } from '@nest-convoy/testing';
import {
  Message,
  ConvoyMessageConsumer,
  ConvoyMessageProducer,
  MissingRequiredMessageHeaderException,
} from '@nest-convoy/messaging';
import {
  CommandMessageHeaders,
  CommandDispatcher,
  CommandDispatcherFactory,
  CommandHandler,
  CommandHandlers,
  CommandMessage,
  MissingCommandHandlerException,
} from '@nest-convoy/commands';

describe('CommandDispatcher', () => {
  let commandDispatcherFactory: CommandDispatcherFactory;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        mockProvider(ConvoyMessageConsumer),
        mockProvider(ConvoyMessageProducer),
        CommandDispatcherFactory,
      ],
    }).compile();

    commandDispatcherFactory = moduleRef.get(CommandDispatcherFactory);
  });

  describe('handleMessage', () => {
    const commandDispatcherId = 'foo';
    const channel = 'test';
    const handler = jest.fn();
    const replyTo = 'replyTo-xxx';

    beforeEach(() => handler.mockClear());

    class TestCommand {
      constructor(readonly id: string) {}
    }

    it('should call "invoke" and "sendReplies" with correct arguments', async () => {
      const commandHandler = new CommandHandler(channel, TestCommand, handler);
      const commandHandlers = new CommandHandlers([commandHandler]);
      const commandDispatcher = commandDispatcherFactory.create(
        commandDispatcherId,
        commandHandlers,
      );
      const invokeSpy = jest
        .spyOn<any, any>(
          commandDispatcher,
          // @ts-ignore
          'invoke',
        )
        .mockResolvedValue([]);
      const sendRepliesSpy = jest.spyOn(
        commandDispatcher,
        // @ts-ignore
        'sendReplies',
      );

      const message = new Message(
        '{"id":"1"}',
        new Map([
          [Message.ID, '1'],
          [CommandMessageHeaders.COMMAND_TYPE, TestCommand.name],
          [CommandMessageHeaders.REPLY_TO, replyTo],
        ]),
      );

      await commandDispatcher.handleMessage(message);
      expect(invokeSpy).toHaveBeenCalledWith(
        commandHandler,
        new CommandMessage(new TestCommand('1'), message.getHeaders(), message),
      );
      expect(sendRepliesSpy).toHaveBeenCalledWith(
        message.getHeaders(),
        [],
        replyTo,
      );
    });

    it('should call "handleException" when "invoke" fails', async () => {
      const commandHandler = new CommandHandler(channel, TestCommand, handler);
      const commandHandlers = new CommandHandlers([commandHandler]);
      const commandDispatcher = commandDispatcherFactory.create(
        commandDispatcherId,
        commandHandlers,
      );
      handler.mockRejectedValue(new Error(''));
      // handler.mockRejectedValue(new Error());
      // const invokeSpy = jest
      //   .spyOn<any, any>(commandDispatcher, 'invoke')
      //   .mockImplementation(async () => {
      //     throw new Error();
      //   });
      const sendRepliesSpy = jest
        .spyOn<any, any>(commandDispatcher, 'sendReplies')
        .mockResolvedValue(undefined);
      const handleExceptionSpy = jest.spyOn<any, any>(
        commandDispatcher,
        'handleException',
      );
      // .mockResolvedValue(undefined);

      const message = new Message(
        '{}',
        new Map([
          [Message.ID, '1'],
          [CommandMessageHeaders.COMMAND_TYPE, TestCommand.name],
          [CommandMessageHeaders.REPLY_TO, replyTo],
        ]),
      );

      await commandDispatcher.handleMessage(message);

      expect(handleExceptionSpy).toHaveBeenCalledWith(message, replyTo);
      expect(sendRepliesSpy).toHaveBeenCalledWith(
        message.getHeaders(),
        [expect.any(Message)],
        replyTo,
      );
    });

    describe('errors', () => {
      let message: Message;
      let commandDispatcher: CommandDispatcher;

      beforeEach(() => {
        message = new Message(
          '{}',
          new Map([
            [Message.ID, '1'],
            // [CommandMessageHeaders.COMMAND_TYPE, Test2Command.name],
          ]),
        );
        const commandHandler = new CommandHandler(
          channel,
          TestCommand,
          handler,
        );
        const commandHandlers = new CommandHandlers([commandHandler]);
        commandDispatcher = commandDispatcherFactory.create(
          commandDispatcherId,
          commandHandlers,
        );
      });

      it('should throw "MissingCommandHandlerException" when command handler cannot be found', async () => {
        class Test2Command {}

        message.setHeader(
          CommandMessageHeaders.COMMAND_TYPE,
          Test2Command.name,
        );

        await expect(() =>
          commandDispatcher.handleMessage(message),
        ).rejects.toThrowError(new MissingCommandHandlerException(message));
      });

      it('should throw "MissingRequiredMessageHeaderException" when reply channel is missing', async () => {
        message.setHeader(CommandMessageHeaders.COMMAND_TYPE, TestCommand.name);

        await expect(() =>
          commandDispatcher.handleMessage(message),
        ).rejects.toThrowError(
          new MissingRequiredMessageHeaderException(
            CommandMessageHeaders.REPLY_TO,
            message,
          ),
        );
      });
    });

    // it('handleMessage', async () => {
    //   const commandHandler = new CommandHandler(channel, Test1Command, handler);
    //   const commandHandlers = new CommandHandlers([commandHandler]);
    //   const commandDispatcher = commandDispatcherFactory.create(
    //     commandDispatcherId,
    //     commandHandlers,
    //   );
    //   const message = commandProducer.createMessage(
    //     channel,
    //     new Test1Command('1'),
    //     replyTo,
    //     new Map([[Message.ID, '999']]),
    //   );
    //   await commandDispatcher.handleMessage(message);
    //   handler.mockClear();
    // });
  });
});
