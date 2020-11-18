import { Injectable } from '@nestjs/common';
import {
  AccountingServiceChannel,
  AuthorizeCommand,
} from '@ftgo-app/api/accounting';

import { CommandEndpoint, Success } from '@nest-convoy/core';

@Injectable()
export class AccountingServiceProxy {
  readonly authorize = new CommandEndpoint(
    AccountingServiceChannel.COMMAND,
    AuthorizeCommand,
    [Success],
  );
}
