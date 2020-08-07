import { Order } from '../entities';

export class ApproveOrderCommand {
  constructor(readonly orderId: Order['id']) {}
}
