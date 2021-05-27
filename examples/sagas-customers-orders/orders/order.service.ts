import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { Transactional } from '@nest-convoy/database';
import { SagaInstanceFactory } from '@nest-convoy/sagas';

import { OrderDetails } from './common';
import { Order } from './entities';
import { CreateOrderSaga, CreateOrderSagaData } from './sagas/create-order';

@Injectable()
export class OrderService {
  constructor(
    private readonly sagaInstanceFactory: SagaInstanceFactory,
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
  ) {}

  @Transactional()
  async create(details: OrderDetails): Promise<Order | null> {
    const data = new CreateOrderSagaData(details);
    await this.sagaInstanceFactory.create(CreateOrderSaga, data);

    return this.orderRepository.findOneOrFail({
      id: data.id,
    });
  }
}
