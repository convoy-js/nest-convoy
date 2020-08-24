import { Injectable } from '@nestjs/common';
import { Message } from '@nest-convoy/messaging/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RuntimeException, NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { SagaStashEntity, SagaLockEntity } from './entities';

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
    @InjectRepository(SagaLockEntity, NEST_CONVOY_CONNECTION)
    private readonly sagaLockRepository: Repository<SagaLockEntity>,
    @InjectRepository(SagaStashEntity, NEST_CONVOY_CONNECTION)
    private readonly sagaStashRepository: Repository<SagaStashEntity>,
  ) {
    super();
  }

  private async getLockedSagaIdByTarget(
    target: string,
  ): Promise<string | null> {
    const entity = await this.sagaLockRepository
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .where({ target })
      .select('saga_id')
      .getOne();

    return entity?.sagaId;
  }

  async claimLock(
    sagaType: string,
    sagaId: string,
    target: string,
  ): Promise<boolean> {
    while (true) {
      try {
        await this.sagaLockRepository.create({
          target,
          sagaType,
          sagaId,
        });
        return true;
      } catch (e) {
        const owningSagaId = await this.getLockedSagaIdByTarget(target);
        if (owningSagaId) {
          return owningSagaId === sagaId;
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
    const messageHeaders = message.getHeadersAsRecord();
    const messageId = message.getRequiredHeader(Message.ID);
    const messagePayload = message.getPayload();

    await this.sagaStashRepository.create({
      messagePayload,
      messageHeaders,
      messageId,
      sagaType,
      sagaId,
      target,
    });
  }

  async unlock(sagaId: string, target: string): Promise<Message | void> {
    const owningSagaId = await this.getLockedSagaIdByTarget(target);
    if (!owningSagaId) {
      throw new RuntimeException(
        `owningSagaId is not present for ${target} ${sagaId}`,
      );
    }

    if (owningSagaId !== sagaId) {
      throw new RuntimeException(
        `Expected owner of ${target} to be ${sagaId} but is ${owningSagaId}`,
      );
    }

    const stashedMessage = await this.sagaStashRepository.findOne({ target });
    if (!stashedMessage) {
      await this.sagaLockRepository.delete({ target });
      return;
    }

    await this.sagaLockRepository.update(
      { target },
      { sagaType: stashedMessage.sagaType, sagaId: stashedMessage.sagaId },
    );
    await this.sagaStashRepository.delete({
      messageId: stashedMessage.messageId,
    });

    return new Message(
      stashedMessage.messagePayload,
      stashedMessage.messageHeaders,
    );
  }
}
