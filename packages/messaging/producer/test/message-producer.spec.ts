import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { mockProvider } from '@nest-convoy/testing';
import {
  ConvoyChannelMapping,
  Message,
  MessageHeaders,
  MessageInterceptor,
  MissingRequiredMessageIDException,
  NEST_CONVOY_MESSAGE_INTERCEPTORS,
} from '@nest-convoy/messaging/common';

import { ConvoyMessageProducer, MessageProducer } from '../message-producer';

@Injectable()
class TestMessageProducer extends MessageProducer {
  async send(
    destination: string,
    message: Message,
    isEvent: boolean,
  ): Promise<void> {}

  async sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent: boolean,
  ): Promise<void> {}
}

@Injectable()
class TestMessageInterceptor implements MessageInterceptor {
  preSend(): void {}
  postSend(): void {}
}

describe('ConvoyMessageProducer', () => {
  let mockedMessageProducer: jest.Mocked<TestMessageProducer>;
  let mockedMessageInterceptor: jest.Mocked<TestMessageInterceptor>;
  let channelMapping: jest.Mocked<ConvoyChannelMapping>;
  let destination: string;
  let messageProducer: any;
  let message: Message;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        mockProvider(TestMessageProducer),
        {
          provide: MessageProducer,
          useExisting: TestMessageProducer,
        },
        mockProvider(ConvoyChannelMapping),
        mockProvider(TestMessageInterceptor),
        {
          provide: NEST_CONVOY_MESSAGE_INTERCEPTORS,
          useFactory(
            messageInterceptor: TestMessageInterceptor,
          ): readonly MessageInterceptor[] {
            return [messageInterceptor];
          },
          inject: [TestMessageInterceptor],
        },
        ConvoyMessageProducer,
      ],
    }).compile();

    message = new Message(
      '{}',
      MessageHeaders.fromRecord({ [Message.ID]: '1' }),
    );
    destination = '';

    mockedMessageProducer = module.get(MessageProducer);
    messageProducer = module.get(ConvoyMessageProducer);
    mockedMessageInterceptor = module.get(TestMessageInterceptor);
    channelMapping = module.get(ConvoyChannelMapping);
  });

  describe('prepareMessageHeaders', () => {
    it('should throw "MissingRequiredMessageIDException" if message is missing ID and implementation cannot generate it', () => {
      message.removeHeader(Message.ID);

      jest
        .spyOn<any, any>(mockedMessageProducer, 'generateMessageId')
        .mockReturnValue(undefined);

      expect(() =>
        messageProducer.prepareMessageHeaders(destination, message),
      ).toThrowError(new MissingRequiredMessageIDException(message));
    });

    it('should transform message destination', () => {
      channelMapping.transform.mockReturnValue('1');

      messageProducer.prepareMessageHeaders(destination, message);

      expect(message.getRequiredHeader(Message.DESTINATION)).toEqual('1');
    });

    it('should add date header to message', () => {
      messageProducer.prepareMessageHeaders(destination, message);

      expect(() => message.getRequiredHeader(Message.DATE)).not.toThrowError();
    });
  });

  describe('preSend', () => {
    it('should call "preSend" method on MessageInterceptor', async () => {
      await messageProducer.preSend(message);

      expect(mockedMessageInterceptor.preSend).toHaveBeenCalledWith(message);
    });
  });

  // TODO: Figure out why "postSend" doesn't get called on MessageInterceptor
  // describe('postSend', () => {
  //   it('should call "postSend" method on MessageInterceptor', async () => {
  //     await messageProducer.postSend(message);
  //
  //     expect(mockedMessageInterceptor.postSend).toHaveBeenCalledWith(message);
  //   });
  // });

  describe('send', () => {
    let prepareMessageHeadersSpy: jest.SpyInstance;
    let preSendSpy: jest.SpyInstance;
    let postSendSpy: jest.SpyInstance;

    beforeEach(() => {
      prepareMessageHeadersSpy = jest
        .spyOn<any, any>(messageProducer, 'prepareMessageHeaders')
        .mockImplementation();

      preSendSpy = jest
        .spyOn<any, any>(messageProducer, 'preSend')
        .mockResolvedValue(undefined);

      postSendSpy = jest
        .spyOn<any, any>(messageProducer, 'postSend')
        .mockResolvedValue(undefined);
    });

    it('should call implementation', async () => {
      await messageProducer.send(destination, message);
      expect(mockedMessageProducer.send).toHaveBeenCalledWith(
        destination,
        message,
        false,
      );
    });

    describe('preSend', () => {
      it('should be called with message', async () => {
        await messageProducer.send(destination, message);

        expect(preSendSpy).toHaveBeenCalledWith(message);
      });
    });

    describe('postSend', () => {
      it('should be called with message and no error', async () => {
        mockedMessageProducer.send.mockResolvedValue(undefined);

        await messageProducer.send(destination, message);

        expect(postSendSpy).toHaveBeenCalledWith(message);
      });

      it('should be called with message and error', async () => {
        const error = new Error();
        mockedMessageProducer.send.mockRejectedValue(error);

        await expect(() =>
          messageProducer.send(destination, message),
        ).rejects.toThrowError(error);

        expect(postSendSpy).toHaveBeenCalledWith(message, error);
      });
    });
  });
});
