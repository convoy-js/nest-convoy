import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SagaInstanceFactory } from '@nest-convoy/core';

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

  async find(id: number): Promise<Order | undefined> {
    return this.orderRepository.findOne(id);
  }

  async create(details: OrderDetails): Promise<Order | undefined> {
    const data = new CreateOrderSagaData(details);
    await this.sagaInstanceFactory.create(CreateOrderSaga, data);

    return this.find(data.orderId!);
  }
}
