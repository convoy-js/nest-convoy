import { Injectable } from '@nestjs/common';
import { CommandEndpointBuilder, Success } from '@nest-convoy/core';

import {
  CustomerServiceChannel,
  ValidateOrderByCustomerCommand,
} from '@ftgo-app/api/customer';

@Injectable()
export class CustomerServiceProxy {
  readonly validateOrder = new CommandEndpointBuilder(
    ValidateOrderByCustomerCommand,
  )
    .withChannel(CustomerServiceChannel.COMMAND)
    .withReply(Success)
    .build();
}
