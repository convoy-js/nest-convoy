import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventBus } from '@nest-convoy/cqrs';

import { AccountDebited } from './account-debited';
import { uniqueId } from './tokens';

@Injectable()
export class TestEventService implements OnApplicationBootstrap {
  constructor(private readonly eventBus: EventBus) {}

  async onApplicationBootstrap(): Promise<void> {
    // const event = new AccountDebited(uniqueId);
    // await this.eventBus.publish(event);
  }
}
