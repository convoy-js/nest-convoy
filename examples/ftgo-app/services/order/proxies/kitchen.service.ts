import { Injectable } from '@nestjs/common';
import { CommandEndpointBuilder, Success } from '@nest-convoy/core';

import {
  CancelCreateTicketCommand,
  ConfirmCreateTicketCommand,
  CreateTicketCommand,
  CreateTicketReply,
  KitchenServiceChannel,
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
}
