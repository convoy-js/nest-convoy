import { forwardRef, Inject, Injectable, Module } from '@nestjs/common';
import {
  SagaCommandProducer,
  SagaInstance,
  SagaInstanceRepository,
} from '@nest-convoy/sagas/orchestration';
import { v4 as uuidv4 } from 'uuid';
import {
  Command,
  CommandMessageHeaders,
  CommandReplyOutcome,
  ConvoyCommandProducer,
  Failure,
  ReplyMessageHeaders,
  Success,
} from '@nest-convoy/commands';
import { SagaManager, NestSaga } from '@nest-convoy/sagas';
import { SagaReplyHeaders } from '@nest-convoy/sagas/common';
import { ModuleRef } from '@nestjs/core';
import {
  ConvoyMessageProducer,
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

import { MessageWithDestination } from './message-with-destination';

@Injectable()
export class SagaTestInstanceRepository extends SagaInstanceRepository {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  private get sagaUnitTestSupport(): SagaUnitTestSupport<any> {
    return this.moduleRef.get(SagaUnitTestSupport);
  }

  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    this.sagaUnitTestSupport.sagaInstance = sagaInstance;
    sagaInstance.sagaId = SagaUnitTestSupport.SAGA_ID;
    return sagaInstance;
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    if (sagaId !== this.sagaUnitTestSupport.sagaInstance.sagaId) {
      throw new Error('some stuff');
    }

    return this.sagaUnitTestSupport.sagaInstance;
  }

  async update(sagaInstance: SagaInstance): Promise<void> {
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
    private readonly sagaInstance: SagaInstance<Data>,
  ) {}

  private async sendReply<T extends object>(
    reply: T,
    outcome: CommandReplyOutcome,
  ): Promise<void> {
    const message = MessageBuilder.withPayload(reply)
      .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
      .withHeader(SagaReplyHeaders.REPLY_SAGA_TYPE, this.sagaInstance.sagaType)
      .withHeader(SagaReplyHeaders.REPLY_SAGA_ID, this.sagaInstance.sagaId)
      .build();

    message.setHeader(Message.ID, uuidv4());
    await this.sagaManager.handleMessage(message);
  }

  async successReply<T>(reply?: T): Promise<void> {
    await this.sendReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
  }

  async failureReply<T>(reply?: T): Promise<void> {
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
  static readonly SAGA_ID = '1';

  private readonly expectations: SagaExpectationTest[][] = [];
  public readonly sentCommands: MessageWithDestination[] = [];
  private sagaManager: SagaManager<any>;
  public sagaInstance: SagaInstance;
  private createException?: Error;
  private counter = 2;

  constructor(
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

  private get sagaInstanceRepository(): SagaInstanceRepository {
    return this.moduleRef.get(SagaTestInstanceRepository);
  }

  private assertNoCommands(): void {
    switch (this.sentCommands.length) {
      case 0:
        break;
      case 1: {
        const mwd = this.sentCommands[0];
        fail(
          `Expected saga to have finished but found a command of ${mwd.message.getRequiredHeader(
            CommandMessageHeaders.COMMAND_TYPE,
          )} sent to ${mwd.destination}: ${mwd.message.toString()}`,
        );
        break;
      }
      default:
        expect(this.sentCommands).toHaveLength(0);
        break;
    }
  }

  genId(): string {
    return String(this.counter++);
  }

  expect<Data = any>(): SagaExpectCommandTest<Data> {
    if (this.createException) {
      throw this.createException;
    }

    const expects: SagaExpectationTest[] = [];
    const idx = this.expectations.push(expects) - 1;

    return new SagaExpectCommandTest(
      idx,
      expects,
      this.sagaManager,
      this.sagaInstance,
    );
  }

  async create<Data>(saga: NestSaga<Data>, sagaData: Data): Promise<this> {
    this.sagaManager = new SagaManager(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      undefined,
      // @ts-ignore
      {
        claimLock: jest.fn().mockReturnValue(true),
      },
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

    expect(this.sagaInstance.endState).toBeTruthy();
    expect(this.sagaInstance.compensating).toBeTruthy();
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
    private readonly sagaUnitTestSupport: SagaUnitTestSupport<any>,
  ) {}

  async send(destination: string, message: Message): Promise<void> {
    const id = this.sagaUnitTestSupport.genId();
    message.setHeader(Message.ID, id);
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
      provide: SagaInstanceRepository,
      useExisting: SagaTestInstanceRepository,
    },
    SagaUnitTestSupport,
  ],
  exports: [SagaUnitTestSupport],
})
export class ConvoySagaTestingModule {}
