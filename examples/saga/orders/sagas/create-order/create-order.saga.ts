import { DomainEventPublisher, Saga } from '@nest-convoy/core';

import { CustomerServiceProxy, OrderServiceProxy } from '../participants';
import { ApproveOrderCommand, RejectOrderCommand } from '../../commands';
import { CreateOrderSagaData } from './create-order-saga.data';
import { BaseCreateOrderSaga } from './base-create-order.saga';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends BaseCreateOrderSaga<CreateOrderSagaData> {
  readonly sagaDefinition = this.step()
    .withCompensation(
      this.orderServiceProxy.reject,
      this.createRejectOrderCommand.bind(this),
    )
    .step()
    .invokeParticipant(
      this.customerServiceProxy.reserveCredit,
      this.createReserveCreditCommand.bind(this),
    )
    .step()
    .invokeParticipant(
      this.orderServiceProxy.approve,
      this.createApproveOrderCommand.bind(this),
    )
    .build();

  constructor(
    protected readonly domainEventPublisher: DomainEventPublisher,
    private readonly orderServiceProxy: OrderServiceProxy,
    private readonly customerServiceProxy: CustomerServiceProxy,
  ) {
    super(CreateOrderSaga, domainEventPublisher);
  }

  private createRejectOrderCommand(
    data: CreateOrderSagaData,
  ): RejectOrderCommand {
    return new RejectOrderCommand(data.orderId);
  }

  private createApproveOrderCommand(
    data: CreateOrderSagaData,
  ): ApproveOrderCommand {
    return new ApproveOrderCommand(data.orderId);
  }
}
