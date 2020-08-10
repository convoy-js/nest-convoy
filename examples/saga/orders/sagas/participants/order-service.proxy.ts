import { Injectable } from '@nestjs/common';
import {
  CommandEndpoint,
  CommandEndpointBuilder,
  Success,
} from '@nest-convoy/core';

import { Channel } from '../../../common';
import { ApproveOrderCommand, RejectOrderCommand } from '../../commands';

@Injectable()
export class OrderServiceProxy {
  readonly reject: CommandEndpoint<
    RejectOrderCommand
  > = CommandEndpointBuilder.forCommand(RejectOrderCommand)
    .withChannel(Channel.ORDER_SERVICE)
    .withReply(Success)
    .build();

  readonly approve: CommandEndpoint<
    ApproveOrderCommand
  > = CommandEndpointBuilder.forCommand(ApproveOrderCommand)
    .withChannel(Channel.ORDER_SERVICE)
    .withReply(Success)
    .build();
}
