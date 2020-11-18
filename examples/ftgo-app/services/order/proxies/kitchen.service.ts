import { Injectable } from '@nestjs/common';
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

import { CommandEndpoint, Success } from '@nest-convoy/core';

@Injectable()
export class KitchenServiceProxy {
  readonly create = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    CreateTicketCommand,
    [CreateTicketReply],
  );

  readonly confirmCreate = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    ConfirmCreateTicketCommand,
    [Success],
  );

  readonly cancel = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    CancelCreateTicketCommand,
    [Success],
  );

  readonly confirmTicketCancel = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    ConfirmCancelTicketCommand,
    [Success],
  );

  readonly undoBeginCancelTicket = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    UndoBeginCancelTicketCommand,
    [Success],
  );

  readonly beginCancelTicket = new CommandEndpoint(
    KitchenServiceChannel.COMMAND,
    BeginCancelTicketCommand,
    [Success],
  );
}
