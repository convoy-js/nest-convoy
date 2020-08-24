import { Injectable } from '@nestjs/common';
import { SagaInstanceFactory } from '@nest-convoy/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entities';
import { OrderDetails } from './common';
import { CreateOrderSaga, CreateOrderSagaData } from './sagas/create-order';

@Injectable()
export class OrderService {
  constructor(
    private readonly sagaInstanceFactory: SagaInstanceFactory,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async find(id: number): Promise<Order> {
    return this.orderRepository.findOne(id);
  }

  async create(details: OrderDetails): Promise<Order> {
    const data = new CreateOrderSagaData(details);
    await this.sagaInstanceFactory.create(CreateOrderSaga, data);

    return this.find(data.orderId);
  }
}
