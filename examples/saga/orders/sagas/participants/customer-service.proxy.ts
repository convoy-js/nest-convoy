import { Injectable } from '@nestjs/common';
import { CommandEndpoint, CommandEndpointBuilder } from '@nest-convoy/saga';
import { Success } from '@nest-convoy/commands';

import { ReserveCreditCommand } from '../../../customers/commands';
import { Channel } from '../../../common';

@Injectable()
export class CustomerServiceProxy {
  readonly reserveCredit: CommandEndpoint<
    ReserveCreditCommand
  > = CommandEndpointBuilder.forCommand(ReserveCreditCommand)
    .withChannel(Channel.CUSTOMER_SERVICE)
    .withReply(Success)
    .build();
}
