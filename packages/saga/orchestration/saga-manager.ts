import { Injectable, Logger, Type } from '@nestjs/common';
import { CommandProducer } from '@nest-convoy/commands/producer';
import { MessageConsumer } from '@nest-convoy/messaging/consumer';
import { RuntimeException } from '@nest-convoy/core';
import { Message } from '@nest-convoy/messaging/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import {
  CommandMessageHeaders,
  CommandReplyOutcome,
  Failure,
  ReplyMessageHeaders,
  Success,
} from '@nest-convoy/commands/common';
import {
  LockTarget,
  SagaLockManager,
  SagaReplyHeaders,
} from '@nest-convoy/saga/common';

import { SagaInstance } from './saga-instance';
import { SagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { Saga } from './saga';
import { SagaDefinition } from './saga-definition';
import { SagaActions } from './saga-actions';
import { DestinationAndResource } from './destination-and-resource';

export interface SagaManager<Data> {
  subscribeToReplyChannel(): void;
  create(sagaData: Data): Promise<SagaInstance<Data>>;
  create(sagaData: Data, lockTarget?: string): Promise<SagaInstance<Data>>;
  create(
    data: Data,
    targetType: Type<any>,
    targetId: string,
  ): Promise<SagaInstance<Data>>;
}

export class InternalSagaManger<Data> implements SagaManager<Data> {
  private readonly logger = new Logger(this.constructor.name);

  private get sagaType(): string {
    return this.saga.getSagaType();
  }

  private get sagaReplyChannel(): string {
    return this.sagaType + '-reply';
  }

  private get sagaSubscriberId(): string {
    return this.sagaType + '-consumer';
  }

  constructor(
    private readonly saga: Saga<Data>,
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly commandProducer: CommandProducer,
    private readonly messageConsumer: MessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  private getSagaDefinition(): SagaDefinition<Data> {
    const sm = this.saga.getSagaDefinition();

    if (sm == null) {
      throw new RuntimeException('state machine cannot be null');
    }

    return sm;
  }

  private createFailureMessage(): Message {
    return MessageBuilder.withPayload('{}')
      .withHeader(
        ReplyMessageHeaders.REPLY_OUTCOME,
        CommandReplyOutcome.FAILURE,
      )
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, Failure.name)
      .build();
  }

  private createSuccessMessage(): Message {
    return MessageBuilder.withPayload('{}')
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

  private async processActions(
    sagaInstance: SagaInstance<Data>,
    sagaData: Data,
    actions: SagaActions<Data>,
  ): Promise<void> {
    while (true) {
      if (actions.localException) {
        actions = this.getSagaDefinition().handleReply(
          actions.updatedState,
          actions.updatedSagaData,
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

        if (!actions.local) break;

        actions = this.getSagaDefinition().handleReply(
          actions.updatedState,
          actions.updatedSagaData,
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

    const actions = this.getSagaDefinition().handleReply(
      sagaInstance.stateName,
      sagaInstance.sagaData,
      message,
    );

    await this.processActions(sagaInstance, sagaInstance.sagaData, actions);
  }

  private async handleMessage(message: Message): Promise<void> {
    this.logger.debug('handleMessage invoked with ' + JSON.stringify(message));
    if (message.hasHeader(SagaReplyHeaders.REPLY_SAGA_ID)) {
      await this.handleReply(message);
    } else {
      this.logger.warn(
        "handleMessage doesn't know what to do with: " +
          JSON.stringify(message),
      );
    }
  }

  subscribeToReplyChannel(): void {
    this.messageConsumer.subscribe(
      this.sagaSubscriberId,
      [this.sagaReplyChannel],
      this.handleMessage.bind(this),
    );
  }

  create(sagaData: Data): Promise<SagaInstance<Data>>;
  create(sagaData: Data, lockTarget?: string): Promise<SagaInstance<Data>>;
  create(
    data: Data,
    targetType: Type<any>,
    targetId: string,
  ): Promise<SagaInstance<Data>>;
  async create(
    sagaData: Data,
    target?: string | Type<any>,
    targetId?: string,
  ): Promise<SagaInstance<Data>> {
    const lockTarget = new LockTarget(target, targetId);
    const resource = lockTarget.target;

    let sagaInstance = new SagaInstance<Data>(
      this.sagaType,
      null,
      '????',
      null,
      sagaData.constructor.name,
      sagaData,
    );

    sagaInstance = await this.sagaInstanceRepository.save(sagaInstance);

    await this.saga.onStarting(sagaInstance.sagaId, sagaData);

    if (resource) {
      if (
        !(await this.sagaLockManager.claimLock(
          this.sagaType,
          sagaInstance.sagaId,
          resource,
        ))
      ) {
        throw new RuntimeException('Cannot claim lock for resource');
      }
    }

    const actions = this.getSagaDefinition().start(sagaData);

    if (actions.localException) {
      throw actions.localException;
    }

    await this.processActions(sagaInstance, sagaData, actions);

    return sagaInstance;
  }
}
