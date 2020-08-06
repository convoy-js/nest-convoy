import { InjectRepository } from '@nestjs/typeorm';
import { CommandWithDestination } from '@nest-convoy/commands';
import { Repository } from 'typeorm';
import { SimpleSaga } from '@nest-convoy/saga';
import { Saga } from '@nest-convoy/cqrs';

import { OrderState, RejectionReason } from '../../common';
import { Order } from '../../entities';
import { ReserveCreditCommand } from '../../commands';
import { CustomerCreditLimitExceeded, CustomerNotFound } from '../../replies';

import { CreateOrderSagaData } from './create-order-saga-data';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends SimpleSaga<CreateOrderSagaData> {
  readonly sagaDefinition = this.step()
    .invokeLocal(this.create)
    .withCompensation(this.reject)
    .step()
    .invokeParticipant(this.reserveCredit)
    .onReply(CustomerNotFound, this.handleCustomerNotFound)
    .onReply(
      CustomerCreditLimitExceeded,
      this.handleCustomerCreditLimitExceeded,
    )
    .step()
    .invokeLocal(this.approve)
    .build();

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {
    super();
  }

  private handleCustomerNotFound(data: CreateOrderSagaData): void {
    data.rejectionReason = RejectionReason.UNKNOWN_CUSTOMER;
  }

  private handleCustomerCreditLimitExceeded(data: CreateOrderSagaData): void {
    data.rejectionReason = RejectionReason.INSUFFICIENT_CREDIT;
  }

  private async create(data: CreateOrderSagaData): Promise<void> {
    const order = await this.orderRepository.create({
      details: data.orderDetails,
    });

    data.orderId = order.id;
  }

  private async approve(data: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(
      { id: data.orderId },
      {
        state: OrderState.APPROVED,
      },
    );
  }

  private async reject({
    orderId,
    rejectionReason,
  }: CreateOrderSagaData): Promise<void> {
    await this.orderRepository.update(
      { id: orderId },
      {
        state: OrderState.REJECTED,
        rejectionReason,
      },
    );
  }

  private reserveCredit({
    orderDetails: { customerId, orderTotal },
    orderId,
  }: CreateOrderSagaData): CommandWithDestination {
    return new CommandWithDestination(
      'customerService',
      new ReserveCreditCommand(customerId, orderId, orderTotal),
    );
  }
}
