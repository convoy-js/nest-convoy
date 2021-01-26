import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LineItemQuantityChange,
  RevisedOrderLineItem,
} from '@ftgo-app/libs/common';
import { ReviseOrderSagaData } from '@ftgo-app/services/order/sagas/revise-order/revise-order-saga.data';
import { ReviseOrderSaga } from '@ftgo-app/services/order/sagas/revise-order/revise-order.saga';

import { DomainEvent, SagaInstanceFactory } from '@nest-convoy/core';

import { Order } from '../entities';
import { OrderNotFoundException, OrderRevision, RevisedOrder } from '../api';
import { OrderDomainEventPublisher } from './order-domain-event-publisher';

type MutateOrder = (order: Order) => readonly DomainEvent[];

@Injectable()
export class OrderService {
  constructor(
    private readonly sagaInstanceFactory: SagaInstanceFactory,
    private readonly domainEventPublisher: OrderDomainEventPublisher,
    @InjectRepository(Order)
    private readonly repository: Repository<Order>,
  ) {}

  private async findOrFail(id: Order['id']): Promise<Order> {
    const order = await this.repository.findOne(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }
    return order;
  }

  private async update(id: Order['id'], mutate?: MutateOrder): Promise<Order> {
    let order = await this.findOrFail(id);
    const events = mutate?.(order);

    order = await this.repository.save(order);
    if (events) {
      await this.domainEventPublisher.publish(order, events);
    }

    return order;
  }

  async approve(id: Order['id']): Promise<void> {
    await this.update(id, order => order.noteApproved());
    // meterRegistry.ifPresent(mr -> mr.counter("approved_orders").increment());
  }

  async reject(id: Order['id']): Promise<void> {
    await this.update(id, order => order.noteRejected());
  }

  async beginCancel(id: Order['id']): Promise<void> {
    await this.update(id, order => order.cancel());
  }

  async undoCancel(id: Order['id']): Promise<void> {
    await this.update(id, order => order.undoPendingCancel());
  }

  async revise(
    orderId: Order['id'],
    orderRevision: OrderRevision,
  ): Promise<Order> {
    const order = await this.findOrFail(orderId);
    const reviseOrderSagaData = new ReviseOrderSagaData({
      customerId: order.details.customerId,
      orderId,
      orderRevision,
    });
    await this.sagaInstanceFactory.create(ReviseOrderSaga, reviseOrderSagaData);
    return order;
  }

  async beginRevise(
    id: Order['id'],
    revision: OrderRevision,
  ): Promise<RevisedOrder> {
    let result: LineItemQuantityChange;
    const order = await this.update(id, order => {
      const rwde = order.revise(revision);
      result = rwde.result;
      return rwde.events;
    });

    return new RevisedOrder(order, result!);
  }

  async undoPendingRevision(id: Order['id']): Promise<void> {
    await this.update(id, order => order.rejectRevision());
  }

  async confirmRevision(
    id: Order['id'],
    revision: OrderRevision,
  ): Promise<void> {
    await this.update(id, order => order.confirmRevision(revision));
  }
}
