import {
  CommandMessage,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import {
  ApproveOrderCommand,
  OrderServiceChannel,
  RejectOrderCommand,
} from '../api';
import { OrderService } from './order.service';

@SagaCommandHandlers(OrderServiceChannel.COMMAND)
export class OrderCommandHandlers {
  constructor(private readonly order: OrderService) {}

  @OnMessage(ApproveOrderCommand)
  async approveOrder({
    command,
  }: CommandMessage<ApproveOrderCommand>): Promise<void> {
    await this.order.approve(command.orderId);
  }

  @OnMessage(RejectOrderCommand)
  async rejectOrder({
    command,
  }: CommandMessage<RejectOrderCommand>): Promise<void> {
    await this.order.reject(command.orderId);
  }
}
