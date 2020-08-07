import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities';
import { OrderState } from '../common';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  private async updateState(id: Order['id'], state: OrderState): Promise<void> {
    await this.orderRepository.update(
      { id },
      {
        state,
      },
    );
  }

  find(id: Order['id']): Promise<Order> {
    return this.orderRepository.findOne(id);
  }

  create(data: Partial<Order>): Promise<Order> {
    return this.orderRepository.save(data);
  }

  async noteCreditReservationFailed(id: Order['id']): Promise<void> {
    await this.updateState(id, OrderState.REJECTED);
  }

  async noteCreditReserved(id: Order['id']): Promise<void> {
    await this.updateState(id, OrderState.APPROVED);
  }
}
