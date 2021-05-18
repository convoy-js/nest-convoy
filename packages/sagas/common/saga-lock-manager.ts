import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, LockMode, MikroORM, wrap } from '@mikro-orm/core';

import { Message } from '@nest-convoy/messaging/common';
import { RuntimeException } from '@nest-convoy/common';

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
    private readonly orm: MikroORM,
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
    const messageId = message.getRequiredHeader(Message.ID);
    const messagePayload = message.getPayload();

    const sagaStash = this.sagaStashRepository.create({
      messagePayload,
      messageHeaders,
      messageId,
      sagaType,
      sagaId,
      target,
    });
    // await this.sagaStashRepository.persistAndFlush(sagaStash);
    this.sagaStashRepository.persist(sagaStash);
  }

  async unlock(sagaId: string, target: string): Promise<Message | void> {
    return this.orm.em.transactional(async em => {
      const owningSaga = await this.getLockedSagaByTarget(target);
      if (!owningSaga) {
        throw new RuntimeException(
          `SagaLockEntity is not present for ${target} ${sagaId}`,
        );
      }

      if (owningSaga.sagaId !== sagaId) {
        throw new RuntimeException(
          `Expected owner of ${target} to be ${sagaId} but is ${owningSaga.sagaId}`,
        );
      }

      const stashedMessage = await this.sagaStashRepository.findOne({ target });
      if (!stashedMessage) {
        em.remove(owningSaga);
        return;
      }

      wrap(owningSaga).assign({
        sagaType: stashedMessage.sagaType,
        sagaId: stashedMessage.sagaId,
      });
      em.persist(owningSaga);

      em.remove(stashedMessage);

      return new Message(
        stashedMessage.messagePayload,
        stashedMessage.messageHeaders,
      );
    });
  }
}
