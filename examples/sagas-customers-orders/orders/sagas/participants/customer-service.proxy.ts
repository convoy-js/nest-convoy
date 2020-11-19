import { Injectable } from '@nestjs/common';

import { Success, CommandEndpoint } from '@nest-convoy/core';

import { ReserveCreditCommand } from '../../../customers/api';
import { Channel } from '../../../common';

@Injectable()
export class CustomerServiceProxy {
  readonly reserveCredit = new CommandEndpoint(
    Channel.CUSTOMER,
    ReserveCreditCommand,
    [Success],
  );
}
