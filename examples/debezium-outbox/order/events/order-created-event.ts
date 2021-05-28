import { EventAggregate } from '@nest-convoy/events/aggregate';

import { Order } from '../entities';

/**
 * An {@link Order} event that indicates an order has been created.
 */
@EventAggregate(Order)
export class OrderCreatedEvent {}
