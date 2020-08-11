import { Type } from '@nestjs/common';
import {
  OnSagaCompletedSuccessfully,
  OnSagaRolledBack,
  DomainEventPublisher,
  SimpleSaga,
} from '@nest-convoy/core';

import { CreateOrderSagaData } from './create-order-saga.data';
import { LocalCreateOrderSagaData } from './local-create-order-saga.data';
import { ReserveCreditCommand } from '../../../customers/commands';
import {
  CreateOrderSagaCompletedSuccessfully,
  CreateOrderSagaRolledBack,
} from '../../events';

export abstract class BaseCreateOrderSaga<
  Data extends CreateOrderSagaData =
    | CreateOrderSagaData
    | LocalCreateOrderSagaData
> extends SimpleSaga<Data>
  implements OnSagaRolledBack<Data>, OnSagaCompletedSuccessfully<Data> {
  protected constructor(
    protected readonly domainEventPublisher: DomainEventPublisher,
  ) {
    super();
  }

  protected createReserveCreditCommand({
    orderDetails: { customerId, orderTotal },
    orderId,
  }: Data): ReserveCreditCommand {
    return new ReserveCreditCommand(customerId, orderId, orderTotal);
  }

  async onSagaCompletedSuccessfully(sagaId: string, data: Data): Promise<void> {
    await this.domainEventPublisher.publish(
      this.constructor as Type<any>,
      sagaId,
      [new CreateOrderSagaCompletedSuccessfully(data.orderId)],
    );
  }

  async onSagaRolledBack(sagaId: string, data: Data): Promise<void> {
    await this.domainEventPublisher.publish(
      this.constructor as Type<any>,
      sagaId,
      [new CreateOrderSagaRolledBack(data.orderId)],
    );
  }
}
