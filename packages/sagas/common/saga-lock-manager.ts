import { EntityRepository, LockMode, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { RuntimeException } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';

import { SagaStash, SagaLock } from './entities';

@Injectable()
export class SagaLockManager {
  async claimLock(
    sagaType: string,
    sagaId: string,
    target: string,
  ): Promise<boolean> {
    return true;
  }

  async stashMessage(
    sagaType: string,
    sagaId: string,
    target: string,
    message: Message,
  ): Promise<void> {}

  async unlock(sagaId: string, target: string): Promise<Message | void> {}
}

@Injectable()
export class SagaDatabaseLockManager extends SagaLockManager {
  constructor(
    @InjectRepository(SagaLock)
    private readonly sagaLockRepository: EntityRepository<SagaLock>,
    @InjectRepository(SagaStash)
    private readonly sagaStashRepository: EntityRepository<SagaStash>,
  ) {
    super();
  }

  private async getLockedSagaByTarget(
    target: string,
  ): Promise<SagaLock | null> {
    return this.sagaLockRepository.findOne(
      {
        target,
      },
      {
        lockMode: LockMode.PESSIMISTIC_WRITE,
      },
    );
  }

  async claimLock(
    sagaType: string,
    sagaId: string,
    target: string,
  ): Promise<boolean> {
    while (true) {
      try {
        const sagaLock = this.sagaLockRepository.create({
          target,
          sagaType,
          sagaId,
        });
        await this.sagaLockRepository.persistAndFlush(sagaLock);

        return true;
      } catch {
        const owningSaga = await this.getLockedSagaByTarget(target);
        if (owningSaga) {
          return owningSaga.sagaId === sagaId;
        }
      }
    }
  }

  async stashMessage(
    sagaType: string,
    sagaId: string,
    target: string,
    message: Message,
  ): Promise<void> {
    const messageHeaders = message.getHeaders().asRecord();
    const messagePayload = message.getPayload();
    const id = message.id;

    const sagaStash = this.sagaStashRepository.create({
      messagePayload,
      messageHeaders,
      id,
      sagaType,
      sagaId,
      target,
    });
    this.sagaStashRepository.persist(sagaStash);
  }

  async unlock(sagaId: string, target: string): Promise<Message | void> {
    const owningSaga = await this.getLockedSagaByTarget(target);
    if (!owningSaga) {
      throw new RuntimeException(
        `SagaLock is not present for ${target} (${sagaId})`,
      );
    }

    if (owningSaga.sagaId !== sagaId) {
      throw new RuntimeException(
        `Expected owner of ${target} to be ${sagaId}, but is ${owningSaga.sagaId}`,
      );
    }

    const stashedMessage = await this.sagaStashRepository.findOne({ target });
    if (!stashedMessage) {
      this.sagaLockRepository.remove(owningSaga);
      return;
    }

    this.sagaLockRepository.persist(
      wrap(owningSaga).assign({
        sagaType: stashedMessage.sagaType,
        sagaId: stashedMessage.sagaId,
      }),
    );

    this.sagaStashRepository.remove(stashedMessage);

    return new Message(
      stashedMessage.messagePayload,
      stashedMessage.messageHeaders,
    );
  }
}
