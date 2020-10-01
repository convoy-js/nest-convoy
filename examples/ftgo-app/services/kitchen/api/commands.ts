import { CommandDestination } from '@nest-convoy/core';

import { RevisedOrderLineItem } from '@ftgo-app/libs/common';
import { RestaurantServiceChannel } from '@ftgo-app/api/restaurant';

import { TicketDetails } from './common';

class RestaurantAndOrderIds {
  constructor(readonly restaurantId: number, readonly orderId: number) {}
}

class ReviseTicket extends RestaurantAndOrderIds {
  constructor(
    restaurantId: number,
    orderId: number,
    readonly revisedOrderLineItems: RevisedOrderLineItem[],
  ) {
    super(restaurantId, orderId);
  }
}

export class BeginCancelTicketCommand extends RestaurantAndOrderIds {}

export class BeginReviseTicketCommand extends ReviseTicket {}

export class ConfirmReviseTicketCommand extends ReviseTicket {}

export class CancelCreateTicketCommand {
  constructor(readonly ticketId: number) {}
}

export class ConfirmCreateTicketCommand {
  constructor(readonly ticketId: number) {}
}

// TODO: Implement this
@CommandDestination(RestaurantServiceChannel.COMMAND)
export class CreateTicketCommand extends RestaurantAndOrderIds {
  constructor(
    restaurantId: number,
    orderId: number,
    readonly ticketDetails: TicketDetails,
  ) {
    super(restaurantId, orderId);
  }
}

export class ChangeTicketLineItemQuantityCommand {
  constructor(readonly orderId: number) {}
}

export class ConfirmCancelTicketCommand extends RestaurantAndOrderIds {}

export class UndoBeginCancelTicketCommand extends RestaurantAndOrderIds {}

export class UndoBeginReviseTicketCommand extends RestaurantAndOrderIds {}
