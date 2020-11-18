import { PublishableEvents, EntityIdVersionAndEventIds } from './interfaces';
import { AggregateRoot } from './aggregate-root';

export class SaveUpdateResult<AR extends AggregateRoot> {
  constructor(
    readonly entityIdVersionAndEventIds: EntityIdVersionAndEventIds,
    readonly publishableEvents: PublishableEvents<AR>,
  ) {}
}
