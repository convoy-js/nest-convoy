import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
} from 'typeorm/index';
import {
  IllegalArgumentException,
  AggregateRoot,
  ResultWithDomainEvents,
} from '@nest-convoy/core';

import { TicketDetails } from '../api/common';
import { TicketLineItem } from './ticket-line-item.entity';
import {
  RevisedOrderLineItem,
  UnsupportedStateTransitionException,
} from '@ftgo-app/libs/common';
import {
  TicketAccepted,
  TicketCancelled,
  TicketCreated,
  TicketPickedUp,
  TicketPreparationCompleted,
  TicketRevised,
} from '@ftgo-app/api/kitchen';

export enum TicketState {
  CREATE_PENDING = 'CREATE_PENDING',
  AWAITING_ACCEPTANCE = 'AWAITING_ACCEPTANCE',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  PICKED_UP = 'PICKED_UP',
  CANCEL_PENDING = 'CANCEL_PENDING',
  CANCELLED = 'CANCELLED',
  REVISION_PENDING = 'REVISION_PENDING',
}

@Entity()
export class Ticket implements AggregateRoot {
  @Column({
    type: 'enum',
    enum: TicketState,
    nullable: true,
  })
  state: TicketState;

  @Column({
    type: 'enum',
    enum: TicketState,
    nullable: true,
  })
  previousState: TicketState;

  // @OneToMany(() => TicketLineItem, lineItem => lineItem.customer, {
  //   cascade: true,
  //   eager: true,
  // })
  // @JoinTable()
  lineItems: TicketLineItem[];

  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  readyBy: Date;

  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  acceptTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  preparingTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  pickedUpTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
    // default: () => 'LOCALTIMESTAMP',
  })
  readyForPickupTime: Date;

  constructor(
    readonly restaurantId: number,
    readonly id: number,
    readonly details: TicketDetails,
  ) {}

  confirmCreate(): [TicketCreated] {
    switch (this.state) {
      case TicketState.CREATE_PENDING:
        this.state = TicketState.AWAITING_ACCEPTANCE;
        return [new TicketCreated(this.id, new TicketDetails([]))];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  accept(readyBy: Date): [TicketAccepted] {
    switch (this.state) {
      case TicketState.AWAITING_ACCEPTANCE:
        // Verify that readyBy is in the futurestate = TicketState.ACCEPTED;
        this.acceptTime = new Date();
        if (this.acceptTime <= readyBy) {
          new IllegalArgumentException(
            `readyBy ${readyBy} is not after now ${this.acceptTime}`,
          );
        }
        this.readyBy = readyBy;
        this.state = TicketState.ACCEPTED;

        return [new TicketAccepted(readyBy)];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  cancelCreate(): [] {
    // TODO
    return [];
  }

  preparing(): [TicketPreparationCompleted] {
    switch (this.state) {
      case TicketState.READY_FOR_PICKUP:
        this.state = TicketState.READY_FOR_PICKUP;
        this.readyForPickupTime = new Date();

        return [new TicketPreparationCompleted()];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  pickedUp(): [TicketPickedUp] {
    switch (this.state) {
      case TicketState.READY_FOR_PICKUP:
        this.state = TicketState.PICKED_UP;
        this.pickedUpTime = new Date();

        return [new TicketPickedUp()];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  changeLineItemQuantity(): [] {
    switch (this.state) {
      case TicketState.AWAITING_ACCEPTANCE:
        // TODO
        return [];
      case TicketState.PREPARING:
        // TODO - too late
        return [];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  cancel(): [] {
    switch (this.state) {
      case TicketState.AWAITING_ACCEPTANCE:
      case TicketState.ACCEPTED:
        this.previousState = this.state;
        this.state = TicketState.CANCEL_PENDING;

        return [];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  confirmCancel(): [TicketCancelled] {
    switch (this.state) {
      case TicketState.CANCEL_PENDING:
        this.state = TicketState.CANCELLED;
        return [new TicketCancelled()];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  undoCancel(): [] {
    switch (this.state) {
      case TicketState.CANCEL_PENDING:
        this.state = this.previousState;

        return [];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  beginReviseOrder(revisedOrderLineItems: RevisedOrderLineItem[]): [] {
    switch (this.state) {
      case TicketState.AWAITING_ACCEPTANCE:
      case TicketState.ACCEPTED:
        this.previousState = this.state;
        this.state = TicketState.REVISION_PENDING;

        return [];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  undoBeginReviseOrder(): [] {
    switch (this.state) {
      case TicketState.REVISION_PENDING:
        this.state = this.previousState;

        return [];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }

  confirmReviseTicket(
    revisedOrderLineItems: RevisedOrderLineItem[],
  ): [TicketRevised] {
    switch (this.state) {
      case TicketState.REVISION_PENDING:
        this.state = this.previousState;

        return [new TicketRevised()];
      default:
        throw new UnsupportedStateTransitionException(this.state);
    }
  }
}
