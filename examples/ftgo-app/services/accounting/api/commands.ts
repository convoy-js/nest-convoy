import { Money } from '@ftgo-app/libs/common';

export class AuthorizeCommand {
  constructor(
    readonly customerId: number,
    readonly orderId: number,
    readonly orderTotal: Money,
  ) {}
}

export class ReverseAuthorizationCommand extends AuthorizeCommand {}

export class ReviseAuthorizationCommand extends AuthorizeCommand {}
