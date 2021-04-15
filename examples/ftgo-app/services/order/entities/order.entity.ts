import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
  LineItemQuantityChange,
  Money,
  UnsupportedStateTransitionException,
} from '@ftgo-app/libs/common';

import {
  AggregateId,
  AggregateRoot,
  ResultWithDomainEvents,
} from '@nest-convoy/core';

import {
  OrderAuthorized,
  OrderCancelled,
  OrderMinimumNotMet,
  OrderRejected,
  OrderRevised,
  OrderRevision,
  OrderRevisionProposed,
} from '../api';
import { OrderLineItem } from './order-line-item.entity';
import { DeliveryInfo } from './delivery-info.entity';
import { PaymentInfo } from './payment-info.entity';
import { OrderDetails } from './order-details.entity';

export enum OrderState {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCEL_PENDING = 'CANCEL_PENDING',
  CANCELLED = 'CANCELLED',
  REVISION_PENDING = 'REVISION_PENDING',
}

@Entity()
export class Order extends AggregateRoot<Order> {
  @PrimaryGeneratedColumn()
  @AggregateId()
  id: number;

  // @PrimaryColumn()
  // customerId: number;
  //
  // @PrimaryColumn()
  // restaurantId: number;

  @OneToOne(() => OrderDetails, details => details.order, {
    cascade: true,
    eager: true,
  })
  details: OrderDetails;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.APPROVAL_PENDING,
  })
  state: OrderState;

  @Column(() => DeliveryInfo)
  deliveryInfo: DeliveryInfo;

  @Column(() => PaymentInfo)
  paymentInfo: PaymentInfo;

  @Column(() => Money)
  minimum = new Money(20);

  cancel(): [] {
    switch (this.state) {
      case OrderState.APPROVED:
        this.state = OrderState.CANCEL_PENDING;
        return [];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  undoPendingCancel() {
    switch (this.state) {
      case OrderState.CANCEL_PENDING:
        this.state = OrderState.APPROVED;
        return [];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  noteCancelled(): [OrderCancelled] {
    switch (this.state) {
      case OrderState.CANCEL_PENDING:
        this.state = OrderState.CANCELLED;
        return [new OrderCancelled()];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  noteApproved(): [OrderAuthorized] {
    switch (this.state) {
      case OrderState.APPROVAL_PENDING:
        this.state = OrderState.APPROVED;
        return [new OrderAuthorized()];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  noteRejected(): [OrderRejected] {
    switch (this.state) {
      case OrderState.APPROVAL_PENDING:
        this.state = OrderState.REJECTED;
        return [new OrderRejected()];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  noteReversingAuthorization(): void {
    throw new Error('Not implemented');
  }

  revise(
    revision: OrderRevision,
  ): ResultWithDomainEvents<LineItemQuantityChange, [OrderRevisionProposed]> {
    switch (this.state) {
      case OrderState.APPROVED:
        const change = this.details.lineItems.quantityChange(revision);
        if (change.newOrderTotal.isGreaterThanOrEqual(this.minimum)) {
          throw new OrderMinimumNotMet();
        }
        this.state = OrderState.REVISION_PENDING;
        return new ResultWithDomainEvents(change, [
          new OrderRevisionProposed(
            revision,
            change.currentOrderTotal,
            change.newOrderTotal,
          ),
        ]);

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  rejectRevision(): [] {
    switch (this.state) {
      case OrderState.REVISION_PENDING:
        this.state = OrderState.APPROVED;
        return [];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  confirmRevision(revision: OrderRevision): [OrderRevised] {
    switch (this.state) {
      case OrderState.REVISION_PENDING:
        const change = this.details.lineItems.quantityChange(revision);
        if (revision.deliveryInfo) {
          this.deliveryInfo = revision.deliveryInfo;
        }

        this.details.lineItems.update(revision);
        this.state = OrderState.APPROVED;

        return [
          new OrderRevised(
            revision,
            change.currentOrderTotal,
            change.newOrderTotal,
          ),
        ];

      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }
}
