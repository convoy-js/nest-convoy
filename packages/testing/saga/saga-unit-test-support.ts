import { forwardRef, Inject, Injectable, Module } from '@nestjs/common';
import {
  SagaCommandProducer,
  SagaInstance,
  SagaInstanceRepository,
} from '@nest-convoy/saga/orchestration';
import {
  Command,
  CommandMessageHeaders,
  CommandReplyOutcome,
  ConvoyCommandProducer,
  Failure,
  ReplyMessageHeaders,
  Success,
} from '@nest-convoy/commands';
import { SagaManager, SimpleSaga } from '@nest-convoy/saga';
import {
  ConvoyMessageProducer,
  Message,
  MessageBuilder,
} from '@nest-convoy/messaging';

import { MessageWithDestination } from './message-with-destination';

export function nextTick(): Promise<void> {
  return new Promise(resolve => process.nextTick(resolve));
}

let globalSagaInstance: SagaInstance;

@Injectable()
export class SagaTestInstanceRepository extends SagaInstanceRepository {
  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    globalSagaInstance = sagaInstance;
    sagaInstance.sagaId = SagaUnitTestSupport.SAGA_ID;
    return sagaInstance;
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    if (sagaId !== globalSagaInstance.sagaId) {
      throw new Error('some stuff');
    }

    return globalSagaInstance;
  }

  async update(sagaInstance: SagaInstance): Promise<void> {
    globalSagaInstance = sagaInstance;
  }
}

@Injectable()
export class SagaUnitTestSupport<Data> {
  static readonly SAGA_ID = '1';

  public sentCommands: MessageWithDestination[] = [];
  private sagaManager: SagaManager<any>;
  private sentCommand: MessageWithDestination;
  private expectedCommand: Command;
  // public sagaInstance: SagaInstance;
  private createException?: Error;
  private counter = 2;

  constructor(
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly sagaCommandProducer: SagaCommandProducer,
    // @Inject(forwardRef(() => SagaInstanceRepository))
    private readonly sagaInstanceRepository: SagaInstanceRepository,
  ) {}

  private assertNoCommands(): void {
    switch (this.sentCommands.length) {
      case 0:
        break;
      case 1: {
        const mwd = this.sentCommands[0];
        fail(
          `Expected saga to have finished but found a command of ${mwd.message.getRequiredHeader(
            CommandMessageHeaders.COMMAND_TYPE,
          )} sent to ${mwd.destination}: ${JSON.stringify(mwd.message)}`,
        );
        break;
      }
      default:
        expect(this.sentCommands).toHaveLength(0);
        break;
    }
  }

  private async sendReply<T extends object>(
    reply: T,
    outcome: CommandReplyOutcome,
  ): Promise<void> {
    const message = MessageBuilder.withPayload(reply)
      .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
      .withExtraHeaders('', this.sentCommand.message.getHeaders())
      .build();

    message.setHeader(Message.ID, this.genId());
    await this.sagaManager.handleMessage(message);
  }

  to(commandChannel: string): this {
    expect(this.sentCommands).toHaveLength(1);
    this.sentCommand = this.sentCommands[0];
    expect(commandChannel).toEqual(this.sentCommand.destination);
    expect(this.expectedCommand.constructor.name).toEqual(
      this.sentCommand.message.getRequiredHeader(
        CommandMessageHeaders.COMMAND_TYPE,
      ),
    );
    this.sentCommands = [];
    return this;
  }

  genId(): string {
    return String(this.counter++);
  }

  command(command: Command): this {
    this.expectedCommand = command;
    return this;
  }

  expect(): this {
    if (this.createException) {
      throw this.createException;
    }
    return this;
  }

  async successReply<T>(reply?: T): Promise<this> {
    await this.sendReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
    // await nextTick();
    return this;
  }

  async failureReply<T>(reply?: T): Promise<this> {
    await this.sendReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
    // await nextTick();
    return this;
  }

  withExtraHeaders(expectedExtraHeaders: Record<string, string>): this {
    const actualHeaders = this.sentCommand.message.getHeaders();
    expect(expectedExtraHeaders).toMatchObject(
      Object.fromEntries(actualHeaders.entries()),
    );
    return this;
  }

  async create<Data>(saga: SimpleSaga<Data>, sagaData: Data): Promise<this> {
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
      // await nextTick();
    } catch (err) {
      this.createException = err;
    }
    return this;
  }

  expectCompletedSuccessfully(): this {
    this.assertNoCommands();
    expect(globalSagaInstance.endState).toBeTruthy();
    expect(globalSagaInstance.compensating).toBeFalsy();

    return this;
  }

  expectRolledBack(): this {
    this.assertNoCommands();
    expect(globalSagaInstance.endState).toBeTruthy();
    expect(globalSagaInstance.compensating).toBeTruthy();
    return this;
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
