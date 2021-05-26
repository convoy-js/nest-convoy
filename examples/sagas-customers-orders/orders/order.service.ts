import { EntityData, EntityRepository, wrap } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { SagaInstanceFactory } from '@nest-convoy/core';

import type { OrderDetails } from './common';
import { Order } from './entities';
import { CreateOrderSaga, CreateOrderSagaData } from './sagas/create-order';

@Injectable()
export class OrderService {
  constructor(
    private readonly sagaInstanceFactory: SagaInstanceFactory,
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
  ) {}

  async update(id: Order['id'], data: Partial<Order>): Promise<Order> {
    const order = await this.orderRepository.findOneOrFail({
      id: data.id,
    });
    wrap(order).assign(data);
    this.orderRepository.persist(order);
    return order;
  }

  save(data: EntityData<Order>): Order {
    const order = this.orderRepository.create(data);
    this.orderRepository.persist(order);
    return order;
  }

  async find(id: Order['id']): Promise<Order | null> {
    return this.orderRepository.findOne({ id });
  }

  async create(details: OrderDetails): Promise<Order | null> {
    const data = new CreateOrderSagaData(details);
    await this.sagaInstanceFactory.create(CreateOrderSaga, data);

    return this.find(data.id!);
  }
}
