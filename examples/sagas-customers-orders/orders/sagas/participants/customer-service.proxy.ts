import { Injectable } from '@nestjs/common';

import { Success, CommandEndpoint } from '@nest-convoy/core';

import { Channel } from '../../../common';
import { ReserveCreditCommand } from '../../../customers/api';

@Injectable()
export class CustomerServiceProxy {
  readonly reserveCredit = new CommandEndpoint(
    Channel.CUSTOMER,
    ReserveCreditCommand,
    [Success],
  );
}
