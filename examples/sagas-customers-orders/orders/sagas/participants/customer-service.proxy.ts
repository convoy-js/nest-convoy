import { Injectable } from '@nestjs/common';
import { Success, CommandEndpointBuilder } from '@nest-convoy/core';

import { ReserveCreditCommand } from '../../../customers/commands';
import { Channel } from '../../../common';

@Injectable()
export class CustomerServiceProxy {
  readonly reserveCredit = CommandEndpointBuilder.forCommand(
    ReserveCreditCommand,
  )
    .withChannel(Channel.CUSTOMER_SERVICE)
    .withReply(Success)
    .build();
}
