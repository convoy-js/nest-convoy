import { Injectable } from '@nestjs/common';
import { CommandEndpointBuilder, Success } from '@nest-convoy/core';

import {
  ApproveOrderCommand,
  OrderServiceChannel,
  RejectOrderCommand,
} from '@ftgo-app/api/order';

@Injectable()
export class OrderServiceProxy {
  readonly approve = new CommandEndpointBuilder(ApproveOrderCommand)
    .withChannel(OrderServiceChannel.COMMAND)
    .withReply(Success)
    .build();

  readonly reject = new CommandEndpointBuilder(RejectOrderCommand)
    .withChannel(OrderServiceChannel.COMMAND)
    .withReply(Success)
    .build();
}
