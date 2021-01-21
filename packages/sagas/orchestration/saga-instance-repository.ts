import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RuntimeException, NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { SagaInstance } from './saga-instance';
import { SagaInstanceEntity, SagaInstanceParticipantsEntity } from './entities';
import { DestinationAndResource } from './destination-and-resource';

@Injectable()
export class SagaInstanceRepository {
  private readonly store = new Map<string, SagaInstance>();

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
export class SagaDatabaseInstanceRepository extends SagaInstanceRepository {
  constructor(
    @InjectRepository(SagaInstanceEntity, NEST_CONVOY_CONNECTION)
    private readonly sagaInstanceRepository: Repository<SagaInstanceEntity>,
    @InjectRepository(SagaInstanceParticipantsEntity, NEST_CONVOY_CONNECTION)
    private readonly sagaInstanceParticipantsRepository: Repository<SagaInstanceParticipantsEntity>,
  ) {
    super();
  }

  private async createDestinationsAndResources({
    destinationsAndResources,
    sagaId,
    sagaType,
  }: SagaInstance): Promise<void> {
    await this.sagaInstanceParticipantsRepository.manager.transaction(manager =>
      Promise.all(
        destinationsAndResources.map(dr =>
          manager.create(SagaInstanceParticipantsEntity, {
            sagaId,
            sagaType,
            ...dr,
          }),
        ),
      ),
    );
  }

  private async findDestinationsAndResources(
    sagaType: string,
    sagaId: string,
  ): Promise<DestinationAndResource[]> {
    const sagaInstanceParticipants = await this.sagaInstanceParticipantsRepository.find(
      {
        sagaType,
        sagaId,
      },
    );

    return sagaInstanceParticipants.map(
      ({ destination, resource }) =>
        new DestinationAndResource(destination, resource),
    );
  }

  async find(sagaType: string, sagaId: string): Promise<SagaInstance> {
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

    return new SagaInstance(
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

  async save(sagaInstance: SagaInstance): Promise<SagaInstance> {
    const entity = await this.sagaInstanceRepository.save(sagaInstance);
    await this.createDestinationsAndResources(sagaInstance);
    return Object.assign(sagaInstance, entity);
  }

  async update({
    sagaType,
    sagaId,
    destinationsAndResources,
    ...sagaInstance
  }: NonNullable<SagaInstance>): Promise<void> {
    const result = await this.sagaInstanceRepository.update(
      {
        sagaType,
        sagaId,
      },
      sagaInstance,
    );

    // eslint-disable-next-line prefer-rest-params
    await this.createDestinationsAndResources(arguments[0] as SagaInstance);
  }
}
