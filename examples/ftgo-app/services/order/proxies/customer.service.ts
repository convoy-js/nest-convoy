import { Injectable } from '@nestjs/common';
import {
  CustomerServiceChannel,
  ValidateOrderByCustomerCommand,
} from '@ftgo-app/api/customer';

import { CommandEndpoint, Success } from '@nest-convoy/core';

@Injectable()
export class CustomerServiceProxy {
  readonly validateOrder = new CommandEndpoint(
    CustomerServiceChannel.COMMAND,
    ValidateOrderByCustomerCommand,
    [Success],
  );
}
