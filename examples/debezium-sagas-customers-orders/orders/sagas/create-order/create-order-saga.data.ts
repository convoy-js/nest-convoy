import type { Order } from '../../entities';

export type CreateOrderDto = Pick<Order, 'id' | 'rejectionReason' | 'details'>;

export class CreateOrderSagaData implements CreateOrderDto {
  id: Order['id'];
  rejectionReason?: Order['rejectionReason'];

  constructor(readonly details: Order['details']) {}
}
