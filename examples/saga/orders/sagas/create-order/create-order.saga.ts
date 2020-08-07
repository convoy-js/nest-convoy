import { InjectRepository } from '@nestjs/typeorm';
import { DomainEventPublisher } from '@nest-convoy/events';
import { Repository } from 'typeorm';
import { Saga } from '@nest-convoy/cqrs';

import { Order } from '../../entities';
import { CustomerServiceProxy, OrderServiceProxy } from '../participants';
import { ApproveOrderCommand, RejectOrderCommand } from '../../commands';
import { CreateOrderSagaData } from './create-order-saga.data';
import { BaseCreateOrderSaga } from './base-create-order.saga';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends BaseCreateOrderSaga<CreateOrderSagaData> {
  readonly sagaDefinition = this.step()
    .withCompensation(
      this.orderServiceProxy.reject,
      this.createRejectOrderCommand,
    )
    .step()
    .invokeParticipant(
      this.customerServiceProxy.reserveCredit,
      this.createReserveCreditCommand,
    )
    .step()
    .invokeParticipant(
      this.orderServiceProxy.approve,
      this.createApproveOrderCommand,
    )
    .build();

  constructor(
    protected readonly domainEventPublisher: DomainEventPublisher,
    private readonly orderServiceProxy: OrderServiceProxy,
    private readonly customerServiceProxy: CustomerServiceProxy,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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
