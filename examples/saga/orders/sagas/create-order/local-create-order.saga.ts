import { Saga } from '@nest-convoy/cqrs';
import { DomainEventPublisher } from '@nest-convoy/events';
import { CustomerServiceProxy } from '../participants';

import { LocalCreateOrderSagaData } from './local-create-order-saga.data';
import { OrderService } from '../../services';
import { BaseCreateOrderSaga } from './base-create-order.saga';

@Saga(LocalCreateOrderSagaData)
export class LocalCreateOrderSaga extends BaseCreateOrderSaga<
  LocalCreateOrderSagaData
> {
  readonly sagaDefinition = this.step()
    .invokeLocal(this.create)
    .withCompensation(this.reject)
    .step()
    .invokeParticipant(
      this.customerServiceProxy.reserveCredit,
      this.createReserveCreditCommand,
    )
    .step()
    .invokeLocal(this.approve)
    .build();

  constructor(
    protected readonly domainEventPublisher: DomainEventPublisher,
    private readonly customerServiceProxy: CustomerServiceProxy,
    private readonly order: OrderService,
  ) {
    super(LocalCreateOrderSaga, domainEventPublisher);
  }

  private async create(data: LocalCreateOrderSagaData): Promise<void> {
    const order = await this.order.create({
      details: data.orderDetails,
    });

    data.orderId = order.id;
  }

  private async reject(data: LocalCreateOrderSagaData): Promise<void> {
    console.log('reject');
    await this.order.noteCreditReservationFailed(data.orderId);
  }

  private async approve(data: LocalCreateOrderSagaData): Promise<void> {
    await this.order.noteCreditReserved(data.orderId);
  }
}
