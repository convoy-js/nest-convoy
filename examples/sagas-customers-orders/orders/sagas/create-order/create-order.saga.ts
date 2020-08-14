import { Saga, NestSaga } from '@nest-convoy/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReserveCreditCommand } from '../../../customers/commands';
import {
  CustomerCreditLimitExceeded,
  CustomerNotFound,
} from '../../../customers/replies';

import { CustomerServiceProxy } from '../participants';

import { CreateOrderSagaData } from './create-order-saga.data';
import { OrderState, RejectionReason } from '../../common';
import { Order } from '../../entities';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends NestSaga<CreateOrderSagaData> {
  readonly sagaDefinition = this.step()
    .invokeLocal(this.create)
    .withCompensation(this.reject)
    .step()
    .invokeParticipant(
      this.customerServiceProxy.reserveCredit,
      this.createReserveCreditCommand,
    )
    .onReply(CustomerNotFound, this.handleCustomerNotFound)
    .onReply(
      CustomerCreditLimitExceeded,
      this.handleCustomerCreditLimitExceeded,
    )
    .step()
    .invokeLocal(this.approve)
    .build();

  constructor(
    private readonly customerServiceProxy: CustomerServiceProxy,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {
    super();
  }

  private handleCustomerNotFound(
    data: CreateOrderSagaData,
    reply: CustomerNotFound,
  ): void {
    data.rejectionReason = RejectionReason.UNKNOWN_CUSTOMER;
  }

  private handleCustomerCreditLimitExceeded(
    data: CreateOrderSagaData,
    reply: CustomerCreditLimitExceeded,
  ): void {
    data.rejectionReason = RejectionReason.INSUFFICIENT_CREDIT;
  }

  private createReserveCreditCommand({
    orderDetails: { customerId, orderTotal },
    orderId,
  }: CreateOrderSagaData): ReserveCreditCommand {
    return new ReserveCreditCommand(customerId, orderId, orderTotal);
  }

  private async create(data: CreateOrderSagaData): Promise<void> {
    const order = await this.orderRepository.save({
      details: data.orderDetails,
    });

    data.orderId = order.id;
  }

  private async approve(data: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(data.orderId, {
      state: OrderState.APPROVED,
    });
  }

  private async reject(data: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(data.orderId, {
      state: OrderState.APPROVED,
      rejectionReason: data.rejectionReason,
    });
  }
}
