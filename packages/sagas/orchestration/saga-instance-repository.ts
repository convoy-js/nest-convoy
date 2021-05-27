import { EntityRepository, wrap } from '@mikro-orm/core';
import type { EntityData } from '@mikro-orm/core/typings';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { databaseTransactionContext } from '@nest-convoy/database';

import { SagaInstance, SagaInstanceParticipants } from './entities';

@Injectable()
export class DefaultSagaInstanceRepository {
  private readonly store = new Map<string, SagaInstance>();

  async create(data: EntityData<SagaInstance>): Promise<SagaInstance> {
    const instance = Object.assign(new SagaInstance(), data);
    return this.save(instance);
  }

  createParticipant(
    data: EntityData<SagaInstanceParticipants>,
  ): SagaInstanceParticipants {
    return Object.assign(new SagaInstanceParticipants(), data);
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    return this.store.get(`${sagaType}-${sagaId}`)!;
  }

  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    this.store.set(
      `${sagaInstance.sagaType}-${sagaInstance.sagaId}`,
      sagaInstance,
    );

    return sagaInstance;
  }

  async update(sagaInstance: SagaInstance): Promise<void> {
    await this.save(sagaInstance);
  }
}

@Injectable()
export class SagaDatabaseInstanceRepository extends DefaultSagaInstanceRepository {
  constructor(
    @InjectRepository(SagaInstance)
    private readonly sagaInstanceRepository: EntityRepository<SagaInstance>,
    @InjectRepository(SagaInstanceParticipants)
    private readonly sagaInstanceParticipantsRepository: EntityRepository<SagaInstanceParticipants>,
  ) {
    super();
  }

  // private async createDestinationsAndResources({
  //   destinationsAndResources,
  //   sagaId,
  //   sagaType,
  // }: ConvoySagaInstance): Promise<void> {
  //   destinationsAndResources.forEach(dr => {
  //     const entity = this.sagaInstanceParticipantsRepository.create({
  //       sagaId,
  //       sagaType,
  //       ...dr,
  //     });
  //     this.sagaInstanceParticipantsRepository.persist(entity);
  //   });
  //
  //   await this.sagaInstanceParticipantsRepository.flush();
  // }

  // private async findDestinationsAndResources(
  //   sagaType: string,
  //   sagaId: string,
  // ): Promise<DestinationAndResource[]> {
  //   const sagaInstanceParticipants =
  //     await this.sagaInstanceParticipantsRepository.find({
  //       sagaType,
  //       sagaId,
  //     });
  //
  //   return sagaInstanceParticipants.map(
  //     ({ destination, resource }) =>
  //       new DestinationAndResource(destination, resource),
  //   );
  // }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    return this.sagaInstanceRepository.findOneOrFail(
      {
        sagaType,
        sagaId,
      },
      ['participants'],
    );

    // const destinationAndResources = await this.findDestinationsAndResources(
    //   sagaType,
    //   sagaId,
    // );
    //
    // const entity = await this.sagaInstanceRepository.findOne({
    //   sagaType,
    //   sagaId,
    // });
    //
    // if (!entity) {
    //   throw new RuntimeException(
    //     `Cannot find saga instance ${sagaType} ${sagaId}`,
    //   );
    // }
    //
    // return new ConvoySagaInstance(
    //   sagaType,
    //   sagaId,
    //   entity.stateName,
    //   entity.lastRequestId,
    //   entity.sagaDataType,
    //   entity.sagaData,
    //   destinationAndResources,
    //   entity.compensating,
    //   entity.endState,
    // );
  }

  createParticipant(
    data: EntityData<SagaInstanceParticipants>,
  ): SagaInstanceParticipants {
    const participant = this.sagaInstanceParticipantsRepository.create(data);
    wrap(participant).assign(data);
    return participant;
  }

  async create(data: EntityData<SagaInstance>): Promise<SagaInstance> {
    const instance = this.sagaInstanceRepository.create(data);
    wrap(instance).assign(data);
    return this.save(instance);
  }

  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    // const entity = this.sagaInstanceRepository.create(sagaInstance);
    await this.sagaInstanceRepository.persistAndFlush(sagaInstance);
    // wrap(entity).assign(sagaInstance);

    // const entity = this.sagaInstanceRepository.create(sagaInstance);
    // this.sagaInstanceRepository.save(entity);
    // await this.createDestinationsAndResources(sagaInstance);
    return sagaInstance;
  }

  async update(instance: SagaInstance): Promise<void> {
    await this.sagaInstanceRepository.persistAndFlush(instance);
    // const result = await this.sagaInstanceRepository.update(
    //   {
    //     sagaType,
    //     sagaId,
    //   },
    //   sagaInstance,
    // );

    // await this.createDestinationsAndResources(
    //   // eslint-disable-next-line prefer-rest-params
    //   arguments[0] as ConvoySagaInstance,
    // );
  }
}
