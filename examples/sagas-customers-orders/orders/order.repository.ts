import { wrap, EntityRepository } from '@mikro-orm/core';
import type { EntityData } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { Order } from './entities';

@Injectable()
export class OrderRepositoryR {
  constructor(
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
}
