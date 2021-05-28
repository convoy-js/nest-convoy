import { EventAggregate } from '@nest-convoy/events/aggregate';

import { Order } from '../entities';

/**
 * An {@link Order} event that indicates an order line's status has changed.
 */
@EventAggregate(Order)
export class OrderLineUpdatedEvent {}
