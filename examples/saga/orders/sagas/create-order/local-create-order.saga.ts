import { Saga, DomainEventPublisher, Failure } from '@nest-convoy/core';

import { OrderService } from '../../services';
import { CustomerServiceProxy } from '../participants';

import { LocalCreateOrderSagaData } from './local-create-order-saga.data';
import { BaseCreateOrderSaga } from './base-create-order.saga';

@Saga(LocalCreateOrderSagaData)
export class LocalCreateOrderSaga extends BaseCreateOrderSaga<
  LocalCreateOrderSagaData
> {
  readonly sagaDefinition = this.step()
    .invokeLocal(this.create.bind(this))
    .withCompensation(this.reject.bind(this))
    .step()
    .invokeParticipant(
      this.customerServiceProxy.reserveCredit,
      this.createReserveCreditCommand.bind(this),
    )
    .onReply(Failure, this.reject.bind(this))
    .step()
    .invokeLocal(this.approve.bind(this))
    .build();

  constructor(
    protected readonly domainEventPublisher: DomainEventPublisher,
    private readonly customerServiceProxy: CustomerServiceProxy,
    private readonly order: OrderService,
  ) {
    super(domainEventPublisher);
  }

  private async create(data: LocalCreateOrderSagaData): Promise<void> {
    const order = await this.order.create({
      details: data.orderDetails,
    });

    data.orderId = order.id;
  }

  private async reject(data: LocalCreateOrderSagaData): Promise<void> {
    await this.order.noteCreditReservationFailed(data.orderId);
  }

  private async approve(data: LocalCreateOrderSagaData): Promise<void> {
    await this.order.noteCreditReserved(data.orderId);
  }
}
