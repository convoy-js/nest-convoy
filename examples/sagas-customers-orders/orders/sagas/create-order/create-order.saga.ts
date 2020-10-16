import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Saga, NestSaga } from '@nest-convoy/core';

import { ReserveCreditCommand } from '../../../customers/commands';
import { OrderState, RejectionReason } from '../../common';
import { CustomerServiceProxy } from '../participants';
import { CreateOrderSagaData } from './create-order-saga.data';
import { Order } from '../../entities';
import {
  CustomerCreditLimitExceeded,
  CustomerNotFound,
} from '../../../customers/replies';

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
    details: { customerId, orderTotal },
    id,
  }: CreateOrderSagaData): ReserveCreditCommand {
    return new ReserveCreditCommand(customerId, id, orderTotal);
  }

  private async create(data: CreateOrderSagaData): Promise<void> {
    const order = await this.orderRepository.save({
      details: data.details,
    });

    data.id = order.id;
  }

  private async approve(data: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(data.id, {
      state: OrderState.APPROVED,
    });
  }

  private async reject(data: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(data.id, {
      state: OrderState.REJECTED,
      rejectionReason: data.rejectionReason,
    });
  }
}
