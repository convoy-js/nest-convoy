import { Saga, NestSaga } from '@nest-convoy/sagas';

import {
  CustomerCreditLimitExceeded,
  CustomerNotFound,
  ReserveCreditCommand,
} from '../../../customers/api';
import { OrderState, RejectionReason } from '../../common';
import { OrderRepositoryR } from '../../order.repository';
import { CustomerServiceProxy } from '../participants';
import { CreateOrderSagaData } from './create-order-saga.data';

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
    private readonly order: OrderRepositoryR,
    private readonly customerServiceProxy: CustomerServiceProxy,
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
    const order = this.order.save(data);
    data.id = order.id;
  }

  private async approve(data: CreateOrderSagaData): Promise<void> {
    await this.order.update(data.id, {
      state: OrderState.APPROVED,
    });
  }

  private async reject(data: CreateOrderSagaData): Promise<void> {
    await this.order.update(data.id, {
      state: OrderState.REJECTED,
      rejectionReason: data.rejectionReason,
    });
  }
}
