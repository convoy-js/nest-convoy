import { forwardRef, Inject, Injectable, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { uuid } from '@deepkit/type';

import { Instance, Reply } from '@nest-convoy/common';
import { SagaManager, NestSaga } from '@nest-convoy/sagas';
import { SagaLockManager, SagaReplyHeaders } from '@nest-convoy/sagas/common';
import {
  SagaCommandProducer,
  ConvoySagaInstance,
  DefaultSagaInstanceRepository,
} from '@nest-convoy/sagas/orchestration';
import {
  Command,
  CommandMessageHeaders,
  CommandReplyOutcome,
  ConvoyCommandProducer,
  Failure,
  ReplyMessageHeaders,
  Success,
} from '@nest-convoy/commands';
import {
  ConvoyMessageConsumer,
  ConvoyMessageProducer,
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

import { mockProvider } from '../common';
import { MessageWithDestination } from './message-with-destination';

@Injectable()
export class SagaTestInstanceRepository extends DefaultSagaInstanceRepository {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  private get sagaUnitTestSupport(): SagaUnitTestSupport<unknown> {
    return this.moduleRef.get(SagaUnitTestSupport);
  }

  async save(sagaInstance: ConvoySagaInstance): Promise<ConvoySagaInstance> {
    sagaInstance.sagaId = uuid();
    this.sagaUnitTestSupport.sagaInstance = sagaInstance;
    return sagaInstance;
  }

  async find(sagaType: string, sagaId: string): Promise<ConvoySagaInstance> {
    if (sagaId !== this.sagaUnitTestSupport.sagaInstance.sagaId) {
      throw new Error('some stuff');
    }

    return this.sagaUnitTestSupport.sagaInstance;
  }

  async update(sagaInstance: ConvoySagaInstance): Promise<void> {
    this.sagaUnitTestSupport.sagaInstance = sagaInstance;
  }
}

export type SagaExpectationTest = (
  sentCommands: MessageWithDestination[],
) => void;

export class SagaExpectCommandTest<Data> {
  private expectedExtraHeaders?: Record<string, string>;
  private expectedCommand: Command;
  private expect: SagaExpectationTest;

  constructor(
    private readonly sentCommandIdx: number,
    private readonly expects: SagaExpectationTest[],
    private readonly sagaManager: SagaManager<Data>,
    private readonly sagaInstance: ConvoySagaInstance<Data>,
  ) {}

  private async sendReply<T extends Instance>(
    reply: T,
    outcome: CommandReplyOutcome,
  ): Promise<void> {
    const message = MessageBuilder.withPayload(reply)
      .withReference(reply)
      .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
      .withHeader(SagaReplyHeaders.REPLY_SAGA_TYPE, this.sagaInstance.sagaType)
      .withHeader(SagaReplyHeaders.REPLY_SAGA_ID, this.sagaInstance.sagaId)
      .build();

    message.setHeader(Message.ID, uuid());
    await this.sagaManager.handleMessage(message);
  }

  async successReply<R extends Reply>(reply?: R): Promise<void> {
    await this.sendReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
  }

  async failureReply<R extends Reply>(reply?: R): Promise<void> {
    await this.sendReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
  }

  command(command: Command): this {
    this.expectedCommand = command;
    return this;
  }

  withExtraHeaders(
    expectedExtraHeaders: MessageHeaders | Record<string, string>,
  ): this {
    this.expectedExtraHeaders =
      expectedExtraHeaders instanceof Map
        ? Object.fromEntries(expectedExtraHeaders.entries())
        : expectedExtraHeaders;

    return this;
  }

  to(commandChannel: string): this {
    this.expect = (sentCommands: MessageWithDestination[]) => {
      const sentCommand = sentCommands[0];

      expect(commandChannel).toEqual(sentCommand.destination);
      expect(this.expectedCommand.constructor.name).toEqual(
        sentCommand.message.getRequiredHeader(
          CommandMessageHeaders.COMMAND_TYPE,
        ),
      );

      if (this.expectedExtraHeaders) {
        const actualHeaders = sentCommand.message.getHeaders();
        expect(Object.fromEntries(actualHeaders.entries())).toEqual(
          expect.objectContaining(this.expectedExtraHeaders),
        );
      }

      sentCommands.shift();
    };

    this.expects.push(this.expect);

    return this;
  }
}

@Injectable()
export class SagaUnitTestSupport<Data> {
  private readonly expectations: SagaExpectationTest[][] = [];
  private sagaManager: SagaManager<Data>;
  private createException?: Error;
  public readonly sentCommands: MessageWithDestination[] = [];
  public sagaInstance: ConvoySagaInstance;

  constructor(
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly sagaCommandProducer: SagaCommandProducer,
    private readonly moduleRef: ModuleRef,
  ) {}

  private runExpectations(): void {
    expect(this.sentCommands).toHaveLength(this.expectations.length);

    this.expectations.forEach(expectations => {
      expectations.forEach(expect => expect(this.sentCommands));
    });
  }

  private get sagaInstanceRepository(): DefaultSagaInstanceRepository {
    return this.moduleRef.get(SagaTestInstanceRepository);
  }

  private assertNoCommands(): void {
    switch (this.sentCommands.length) {
      case 0:
        break;
      case 1:
        const { message, destination } = this.sentCommands[0];
        fail(
          `Expected saga to have finished but found a command of ${message.getRequiredHeader(
            CommandMessageHeaders.COMMAND_TYPE,
          )} sent to ${destination}: ${message.toString()}`,
        );
        break;
      default:
        expect(this.sentCommands).toHaveLength(0);
        break;
    }
  }

  expect(): SagaExpectCommandTest<Data> {
    if (this.createException) {
      throw this.createException;
    }

    const expects: SagaExpectationTest[] = [];
    const idx = this.expectations.push(expects) - 1;

    return new SagaExpectCommandTest<Data>(
      idx,
      expects,
      this.sagaManager,
      this.sagaInstance,
    );
  }

  async create(saga: NestSaga<Data>, sagaData: Data): Promise<this> {
    class TestSagaLockManager extends SagaLockManager {
      claimLock = jest.fn().mockReturnValue(true);
    }

    this.sagaManager = new SagaManager(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      this.messageConsumer,
      new TestSagaLockManager(),
      this.sagaCommandProducer,
    );
    try {
      await this.sagaManager.create(sagaData);
    } catch (err) {
      this.createException = err;
    }
    return this;
  }

  expectCompletedSuccessfully(): void {
    this.runExpectations();
    this.assertNoCommands();

    expect(this.sagaInstance.endState).toBeTruthy();
    expect(this.sagaInstance.compensating).toBeFalsy();
  }

  expectRolledBack(): void {
    this.runExpectations();
    this.assertNoCommands();

    if (!this.sagaInstance.endState) {
      fail('Expected ' + this.sagaInstance.sagaType + ' to have end state');
    }

    if (!this.sagaInstance.compensating) {
      fail('Expected ' + this.sagaInstance.sagaType + ' to be compensating');
    }
  }

  expectException(expectedException: Error): this {
    expect(this.createException).toBe(expectedException);
    return this;
  }
}

@Injectable()
export class TestMessageProducer {
  constructor(
    @Inject(forwardRef(() => SagaUnitTestSupport))
    private readonly sagaUnitTestSupport: SagaUnitTestSupport<Instance>,
  ) {}

  async send(destination: string, message: Message): Promise<void> {
    message.setHeader(Message.ID, uuid());
    this.sagaUnitTestSupport.sentCommands.push(
      new MessageWithDestination(destination, message),
    );
  }
}

@Module({
  providers: [
    TestMessageProducer,
    {
      provide: ConvoyMessageProducer,
      useExisting: TestMessageProducer,
    },
    ConvoyCommandProducer,
    SagaCommandProducer,
    SagaTestInstanceRepository,
    {
      provide: DefaultSagaInstanceRepository,
      useExisting: SagaTestInstanceRepository,
    },
    SagaUnitTestSupport,
    mockProvider(ConvoyMessageConsumer),
  ],
  exports: [SagaUnitTestSupport],
})
export class ConvoySagaTestingModule {}
