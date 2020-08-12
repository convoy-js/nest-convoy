import { Injectable } from '@nestjs/common';
import {
  Success,
  CommandEndpoint,
  CommandEndpointBuilder,
} from '@nest-convoy/core';

import { ReserveCreditCommand } from '../../../customers/commands';
import { Channel } from '../../../../sagas-customers-orders/common';

@Injectable()
export class CustomerServiceProxy {
  readonly reserveCredit: CommandEndpoint<
    ReserveCreditCommand
  > = CommandEndpointBuilder.forCommand(ReserveCreditCommand)
    .withChannel(Channel.CUSTOMER_SERVICE)
    .withReply(Success)
    .build();
}
