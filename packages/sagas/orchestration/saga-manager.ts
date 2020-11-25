import { Logger, Type } from '@nestjs/common';

import { Instance } from '@nest-convoy/common';
import {
  Message,
  MessageBuilder,
  ConvoyMessageConsumer,
  MessageHeaders,
} from '@nest-convoy/messaging';
import {
  CommandMessageHeaders,
  CommandReplyOutcome,
  Failure,
  ReplyMessageHeaders,
  Success,
  ConvoyCommandProducer,
  LockTarget,
} from '@nest-convoy/commands';
import {
  CannotClaimResourceLockException,
  SagaCommandHeaders,
  SagaLockManager,
  SagaReplyHeaders,
  SagaUnlockCommand,
  StateMachineEmptyException,
} from '@nest-convoy/sagas/common';

import { SagaInstance } from './saga-instance';
import { SagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { Saga, SagaLifecycleHooks } from './saga';
import { SagaDefinition } from './saga-definition';
import { SagaActions } from './saga-actions';
import { DestinationAndResource } from './destination-and-resource';

export class SagaManager<Data> {
  private readonly logger = new Logger(this.constructor.name, true);

  private get sagaType(): string {
    return this.saga.constructor.name;
  }

  private get sagaReplyChannel(): string {
    return this.sagaType + '-reply';
  }

  private get sagaSubscriberId(): string {
    return this.sagaType + '-consumer';
  }

  constructor(
    private readonly saga: Saga<Data> & SagaLifecycleHooks<Data>,
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  private getSagaDefinition(): SagaDefinition<Data> {
    const sm = this.saga.sagaDefinition;

    if (!sm) {
      throw new StateMachineEmptyException(
        this.saga.constructor as Type<Saga<Data>>,
      );
    }

    return sm;
  }

  private createFailureMessage(): Message {
    return MessageBuilder.withPayload()
      .withHeader(
        ReplyMessageHeaders.REPLY_OUTCOME,
        CommandReplyOutcome.FAILURE,
      )
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, Failure.name)
      .build();
  }

  private createSuccessMessage(): Message {
    return MessageBuilder.withPayload()
      .withHeader(
        ReplyMessageHeaders.REPLY_OUTCOME,
        CommandReplyOutcome.SUCCESS,
      )
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, Success.name)
      .build();
  }

  private updateState(
    sagaInstance: SagaInstance<Data>,
    actions: SagaActions<Data>,
  ): void {
    if (actions.updatedState) {
      sagaInstance.stateName = actions.updatedState;
      sagaInstance.endState = actions.endState;
      sagaInstance.compensating = actions.compensating;
    }
  }

  private async performEndStateActions(
    sagaId: string,
    sagaInstance: SagaInstance<Data>,
    compensating: boolean,
    sagaData: Data,
  ): Promise<void> {
    for (const dr of sagaInstance.destinationsAndResources) {
      const headers = new MessageHeaders();
      headers.set(SagaCommandHeaders.SAGA_ID, sagaId);
      headers.set(SagaCommandHeaders.SAGA_TYPE, this.sagaType);
      await this.commandProducer.send(
        dr.destination,
        new SagaUnlockCommand(),
        this.sagaReplyChannel,
        headers,
        dr.resource,
      );
    }

    if (compensating) {
      await this.saga.onSagaRolledBack?.(sagaInstance.sagaId, sagaData);
    } else {
      await this.saga.onSagaCompletedSuccessfully?.(
        sagaInstance.sagaId,
        sagaData,
      );
    }
  }

  private async processActions(
    sagaInstance: SagaInstance<Data>,
    sagaData: Data,
    actions: SagaActions<Data>,
  ): Promise<void> {
    while (true) {
      if (actions.localException) {
        actions = await this.getSagaDefinition().handleReply(
          actions.updatedState!,
          actions.updatedSagaData!,
          this.createFailureMessage(),
        );
      } else {
        // only do this if successful
        sagaInstance.lastRequestId = await this.sagaCommandProducer.sendCommands(
          this.sagaType,
          sagaInstance.sagaId,
          actions.commands,
          this.sagaReplyChannel,
        );

        this.updateState(sagaInstance, actions);

        sagaInstance.sagaData = actions.updatedSagaData || sagaData;

        if (actions.endState) {
          await this.performEndStateActions(
            sagaInstance.sagaId,
            sagaInstance,
            actions.compensating,
            sagaData,
          );
        }

        await this.sagaInstanceRepository.update(sagaInstance);

        if (!actions.local) break;

        actions = await this.getSagaDefinition().handleReply(
          actions.updatedState!,
          actions.updatedSagaData!,
          this.createSuccessMessage(),
        );
      }
    }
  }

  private isReplyForThisSagaType(message: Message): boolean {
    const sagaReplyType = message.getHeader(SagaReplyHeaders.REPLY_SAGA_TYPE);
    return sagaReplyType === this.sagaType;
  }

  private async handleReply(message: Message): Promise<void> {
    if (!this.isReplyForThisSagaType(message)) return;

    const sagaId = message.getRequiredHeader(SagaReplyHeaders.REPLY_SAGA_ID);
    const sagaType = message.getRequiredHeader(
      SagaReplyHeaders.REPLY_SAGA_TYPE,
    );

    const sagaInstance = await this.sagaInstanceRepository.find(
      sagaType,
      sagaId,
    );

    const lockedTarget = message.getHeader(SagaReplyHeaders.REPLY_LOCKED);
    if (lockedTarget) {
      const destination = message.getRequiredHeader(
        CommandMessageHeaders.inReply(CommandMessageHeaders.DESTINATION),
      );
      sagaInstance.destinationsAndResources.push(
        new DestinationAndResource(destination, lockedTarget),
      );
    }

    const actions = await this.getSagaDefinition().handleReply(
      sagaInstance.stateName,
      sagaInstance.sagaData,
      message,
    );

    await this.processActions(sagaInstance, sagaInstance.sagaData, actions);
  }

  async handleMessage(message: Message): Promise<void> {
    this.logger.debug(`handleMessage invoked with - ${message.toString()}`);

    if (message.hasHeader(SagaReplyHeaders.REPLY_SAGA_ID)) {
      await this.handleReply(message);
    } else {
      this.logger.warn(
        "handleMessage doesn't know what to do with: " + message.toString(),
      );
    }
  }

  async subscribeToReplyChannel(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.sagaSubscriberId,
      [this.sagaReplyChannel],
      this.handleMessage.bind(this),
    );
  }

  create(data: Data): Promise<SagaInstance<Data>>;
  create(data: Data, lockTarget?: string): Promise<SagaInstance<Data>>;
  create(
    data: Data,
    targetType: Instance,
    targetId: string,
  ): Promise<SagaInstance<Data>>;
  async create(
    sagaData: Data,
    target?: string | Instance,
    targetId?: string,
  ): Promise<SagaInstance<Data>> {
    const lockTarget = new LockTarget(target, targetId);
    const resource = lockTarget.target;

    let sagaInstance = new SagaInstance<Data>(
      this.sagaType,
      null as never,
      '????',
      undefined,
      (<Instance>sagaData).constructor.name,
      sagaData,
    );

    sagaInstance = await this.sagaInstanceRepository.save(sagaInstance);

    await this.saga.onStarting?.(sagaInstance.sagaId, sagaData);

    if (resource) {
      if (
        !(await this.sagaLockManager.claimLock(
          this.sagaType,
          sagaInstance.sagaId,
          resource,
        ))
      ) {
        throw new CannotClaimResourceLockException();
      }
    }

    const actions = await this.getSagaDefinition().start(sagaData);

    if (actions.localException) {
      throw actions.localException;
    }

    await this.processActions(sagaInstance, sagaData, actions);

    return sagaInstance;
  }
}
