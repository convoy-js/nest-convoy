import { OrderRevision } from './common';

export class ApproveOrderCommand {
  constructor(readonly orderId: number) {}
}

export class BeginCancelOrderCommand {
  constructor(readonly orderId: number) {}
}

export class BeginReviseOrderCommand {
  constructor(readonly orderId: number, revision: OrderRevision) {}
}

export class ConfirmCancelOrderCommand {
  constructor(readonly orderId: number) {}
}

export class ConfirmReviseOrderCommand {
  constructor(readonly orderId: number, revision: OrderRevision) {}
}

export class RejectOrderCommand {
  constructor(readonly orderId: number) {}
}

export class ReviseOrderUpdateCommand {
  constructor(readonly orderId: number) {}
}

export class UndoBeginCancelOrderCommand {
  constructor(readonly orderId: number) {}
}

export class UndoBeginReviseOrderCommand {
  constructor(readonly orderId: number) {}
}
