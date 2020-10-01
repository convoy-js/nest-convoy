import { Injectable } from '@nestjs/common';
import { CommandEndpointBuilder, Success } from '@nest-convoy/core';

import { AuthorizeCommand } from '@ftgo-app/api/accounting';

@Injectable()
export class AccountingServiceProxy {
  readonly authorize = new CommandEndpointBuilder(AuthorizeCommand)
    .withChannel(AuthorizeCommand)
    .withReply(Success)
    .build();
}
