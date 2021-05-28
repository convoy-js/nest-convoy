import { EntityRepository, wrap } from '@mikro-orm/core';
import type { EntityData } from '@mikro-orm/core/typings';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { SagaInstance, SagaInstanceParticipant } from './entities';

@Injectable()
export class DefaultSagaInstanceRepository {
  private readonly store = new Map<string, SagaInstance>();

  async create(data: EntityData<SagaInstance>): Promise<SagaInstance> {
    const instance = Object.assign(new SagaInstance(), data);
    return this.save(instance);
  }

  createParticipant(
    data: EntityData<SagaInstanceParticipant>,
  ): SagaInstanceParticipant {
    return Object.assign(new SagaInstanceParticipant(), data);
  }

  assign<I extends SagaInstance, K extends keyof I>(
    instance: I,
    data: EntityData<I>,
  ): void {
    Object.entries(data).forEach(([key, value]) => {
      instance[key as K] = value;
    });
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    return this.store.get(`${sagaType}-${sagaId}`)!;
  }

  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    this.store.set(`${sagaInstance.type}-${sagaInstance.id}`, sagaInstance);

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
    @InjectRepository(SagaInstanceParticipant)
    private readonly sagaInstanceParticipantsRepository: EntityRepository<SagaInstanceParticipant>,
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

  assign(instance: SagaInstance, data: EntityData<SagaInstance>): void {
    wrap(instance).assign(data);
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
    return this.sagaInstanceRepository.findOneOrFail(
      {
        type: sagaType,
        id: sagaId,
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
    data: EntityData<SagaInstanceParticipant>,
  ): SagaInstanceParticipant {
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
