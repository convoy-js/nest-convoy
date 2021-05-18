import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, MikroORM, wrap } from '@mikro-orm/core';

import { RuntimeException, NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { NestSagaInstance } from './saga-instance';
import { SagaInstance, SagaInstanceParticipants } from './entities';
import { DestinationAndResource } from './destination-and-resource';

@Injectable()
export class SagaInstanceRepository {
  private readonly store = new Map<string, NestSagaInstance>();

  async find(sagaType: string, sagaId: string): Promise<NestSagaInstance> {
    return this.store.get(`${sagaType}-${sagaId}`)!;
  }

  async save(sagaInstance: NestSagaInstance): Promise<NestSagaInstance> {
    this.store.set(
      `${sagaInstance.sagaType}-${sagaInstance.sagaId}`,
      sagaInstance,
    );

    return sagaInstance;
  }

  async update(sagaInstance: NestSagaInstance): Promise<void> {
    await this.save(sagaInstance);
  }
}

@Injectable()
export class SagaDatabaseInstanceRepository extends SagaInstanceRepository {
  constructor(
    private readonly orm: MikroORM,
    @InjectRepository(SagaInstance)
    private readonly sagaInstanceRepository: EntityRepository<SagaInstance>,
    @InjectRepository(SagaInstanceParticipants)
    private readonly sagaInstanceParticipantsRepository: EntityRepository<SagaInstanceParticipants>,
  ) {
    super();
  }

  private async createDestinationsAndResources({
    destinationsAndResources,
    sagaId,
    sagaType,
  }: NestSagaInstance): Promise<void> {
    // await this.orm.em.transactional(async em => {
    destinationsAndResources.forEach(dr => {
      const entity = this.sagaInstanceParticipantsRepository.create({
        sagaId,
        sagaType,
        ...dr,
      });
      this.sagaInstanceRepository.persist(entity);
    });
    // });
  }

  private async findDestinationsAndResources(
    sagaType: string,
    sagaId: string,
  ): Promise<DestinationAndResource[]> {
    const sagaInstanceParticipants =
      await this.sagaInstanceParticipantsRepository.find({
        sagaType,
        sagaId,
      });

    return sagaInstanceParticipants.map(
      ({ destination, resource }) =>
        new DestinationAndResource(destination, resource),
    );
  }

  async find(sagaType: string, sagaId: string): Promise<NestSagaInstance> {
    const destinationAndResources = await this.findDestinationsAndResources(
      sagaType,
      sagaId,
    );

    const entity = await this.sagaInstanceRepository.findOne({
      sagaType,
      sagaId,
    });

    if (!entity) {
      throw new RuntimeException(
        `Cannot find saga instance ${sagaType} ${sagaId}`,
      );
    }

    return new NestSagaInstance(
      sagaType,
      sagaId,
      entity.stateName,
      entity.lastRequestId,
      entity.sagaDataType,
      entity.sagaData,
      destinationAndResources,
      entity.compensating,
      entity.endState,
    );
  }

  async save(sagaInstance: NestSagaInstance): Promise<NestSagaInstance> {
    const entity = this.sagaInstanceRepository.create(sagaInstance);
    this.sagaInstanceRepository.persist(entity);
    // wrap(entity).assign(sagaInstance);

    // const entity = this.sagaInstanceRepository.create(sagaInstance);
    // this.sagaInstanceRepository.persist(entity);
    await this.createDestinationsAndResources(sagaInstance);
    return Object.assign(sagaInstance, entity);
  }

  async update({
    sagaType,
    sagaId,
    destinationsAndResources,
    ...sagaInstance
  }: NonNullable<NestSagaInstance>): Promise<void> {
    const entity = this.sagaInstanceRepository.create({
      sagaType,
      sagaId,
      ...sagaInstance,
    });
    this.sagaInstanceRepository.persist(entity);
    // const result = await this.sagaInstanceRepository.update(
    //   {
    //     sagaType,
    //     sagaId,
    //   },
    //   sagaInstance,
    // );

    // eslint-disable-next-line prefer-rest-params
    await this.createDestinationsAndResources(arguments[0] as NestSagaInstance);
  }
}
