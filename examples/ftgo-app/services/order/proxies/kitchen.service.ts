import { Injectable } from '@nestjs/common';
import { CommandEndpointBuilder, Success } from '@nest-convoy/core';

import {
  BeginCancelTicketCommand,
  CancelCreateTicketCommand,
  ConfirmCancelTicketCommand,
  ConfirmCreateTicketCommand,
  CreateTicketCommand,
  CreateTicketReply,
  KitchenServiceChannel,
  UndoBeginCancelTicketCommand,
} from '@ftgo-app/api/kitchen';

@Injectable()
export class KitchenServiceProxy {
  readonly create = new CommandEndpointBuilder(CreateTicketCommand)
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(CreateTicketReply)
    .build();

  readonly confirmCreate = new CommandEndpointBuilder(
    ConfirmCreateTicketCommand,
  )
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(Success)
    .build();

  readonly cancel = new CommandEndpointBuilder(CancelCreateTicketCommand)
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(Success)
    .build();

  readonly confirmTicketCancel = new CommandEndpointBuilder(
    ConfirmCancelTicketCommand,
  )
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(Success)
    .build();

  readonly undoBeginCancelTicket = new CommandEndpointBuilder(
    UndoBeginCancelTicketCommand,
  )
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(Success)
    .build();

  readonly beginCancelTicket = new CommandEndpointBuilder(
    BeginCancelTicketCommand,
  )
    .withChannel(KitchenServiceChannel.COMMAND)
    .withReply(Success)
    .build();
}
