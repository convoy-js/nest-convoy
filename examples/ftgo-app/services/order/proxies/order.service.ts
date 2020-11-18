import { Injectable } from '@nestjs/common';
import {
  ApproveOrderCommand,
  BeginCancelOrderCommand,
  OrderServiceChannel,
  RejectOrderCommand,
  UndoBeginCancelOrderCommand,
} from '@ftgo-app/api/order';

import { CommandEndpoint, Success } from '@nest-convoy/core';

@Injectable()
export class OrderServiceProxy {
  readonly approve = new CommandEndpoint(
    OrderServiceChannel.COMMAND,
    ApproveOrderCommand,
    [Success],
  );

  readonly reject = new CommandEndpoint(
    OrderServiceChannel.COMMAND,
    RejectOrderCommand,
    [Success],
  );

  readonly beginCancel = new CommandEndpoint(
    OrderServiceChannel.COMMAND,
    BeginCancelOrderCommand,
    [Success],
  );

  readonly undoBeginCancel = new CommandEndpoint(
    OrderServiceChannel.COMMAND,
    UndoBeginCancelOrderCommand,
    [Success],
  );
}
