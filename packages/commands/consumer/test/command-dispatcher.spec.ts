import { Test } from '@nestjs/testing';

import { mockProvider } from '@nest-convoy/testing';
import {
  Message,
  ConvoyMessageConsumer,
  ConvoyMessageProducer,
  MissingMessageHeaderException,
  MessageHeaders,
} from '@nest-convoy/messaging';
import {
  CommandMessageHeaders,
  correlateMessageHeaders,
  MissingCommandHandlerException,
} from '@nest-convoy/commands/common';
import {
  ConvoyCommandDispatcher,
  CommandDispatcherFactory,
  CommandHandler,
  CommandHandlers,
  CommandMessage,
} from '@nest-convoy/commands/consumer';

describe('CommandDispatcher', () => {
  let commandDispatcherFactory: CommandDispatcherFactory;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        mockProvider(ConvoyMessageConsumer),
        mockProvider(ConvoyMessageProducer),
        CommandDispatcherFactory,
      ],
    }).compile();

    commandDispatcherFactory = module.get(CommandDispatcherFactory);
  });

  describe('handleMessage', () => {
    const commandDispatcherId = 'foo';
    const channel = 'test';
    const replyTo = 'replyTo-xxx';
    let handler: jest.Mock;

    beforeEach(() => (handler = jest.fn()));

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
        .spyOn<any, any>(commandDispatcher, 'invoke')
        .mockResolvedValue([]);
      const sendRepliesSpy = jest.spyOn<any, any>(
        commandDispatcher,
        'sendReplies',
      );

      const message = new Message(
        '{"id":"1"}',
        new MessageHeaders([
          [Message.ID, '1'],
          [CommandMessageHeaders.COMMAND_TYPE, TestCommand.name],
          [CommandMessageHeaders.REPLY_TO, replyTo],
        ]),
      );

      await commandDispatcher.handleMessage(message);
      const correlationHeaders = correlateMessageHeaders(message.getHeaders());
      expect(invokeSpy).toHaveBeenCalledWith(
        commandHandler,
        new CommandMessage(new TestCommand('1'), correlationHeaders, message),
      );
      expect(sendRepliesSpy).toHaveBeenCalledWith(
        correlationHeaders,
        [],
        replyTo,
      );
    });

    // it('should call "handleException" when "invoke" fails', async () => {
    //   const commandHandler = new CommandHandler(channel, TestCommand, handler);
    //   const commandHandlers = new CommandHandlers([commandHandler]);
    //   const commandDispatcher = commandDispatcherFactory.create(
    //     commandDispatcherId,
    //     commandHandlers,
    //   );
    //   handler.mockRejectedValue(new Error(''));
    //   // handler.mockRejectedValue(new Error());
    //   // const invokeSpy = jest
    //   //   .spyOn<any, any>(commandDispatcher, 'invoke')
    //   //   .mockImplementation(async () => {
    //   //     throw new Error();
    //   //   });
    //   const sendRepliesSpy = jest
    //     .spyOn<any, any>(commandDispatcher, 'sendReplies')
    //     .mockResolvedValue(undefined);
    //   const handleExceptionSpy = jest.spyOn<any, any>(
    //     commandDispatcher,
    //     'handleException',
    //   );
    //   // .mockResolvedValue(undefined);
    //
    //   const message = new Message(
    //     '{}',
    //     new Map([
    //       [Message.ID, '1'],
    //       [CommandMessageHeaders.COMMAND_TYPE, TestCommand.name],
    //       [CommandMessageHeaders.REPLY_TO, replyTo],
    //     ]),
    //   );
    //
    //   await commandDispatcher.handleMessage(message);
    //   const correlationHeaders = correlateMessageHeaders(message.getHeaders());
    //
    //   expect(handleExceptionSpy).toHaveBeenCalledWith(message, replyTo);
    //   expect(sendRepliesSpy).toHaveBeenCalledWith(
    //     correlationHeaders,
    //     [expect.any(Message)],
    //     replyTo,
    //   );
    // });

    describe('errors', () => {
      let message: Message;
      let commandDispatcher: ConvoyCommandDispatcher;

      beforeEach(() => {
        message = new Message(
          '{}',
          new MessageHeaders([
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
          new MissingMessageHeaderException(
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
