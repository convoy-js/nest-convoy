import { Test } from '@nestjs/testing';
import { Type } from '@nestjs/common';
import { uuid } from '@deepkit/type';

import { EventIdTypeAndData } from '../../interfaces';
import { AggregateRoot } from '../../aggregate-root';
import { AggregateSchemaModule } from '../aggregate-schema.module';
import { ConfigurableEventSchema } from '../configurable-event-schema';
import { EventUpcaster } from '../aggregate-schema-version';
import { DefaultEventSchemaManager } from '../event-schema-manager';
import { AggregateVersion } from '../../decorators';

class Account extends AggregateRoot {
  @AggregateVersion()
  version: number;
}

class Order extends AggregateRoot {
  @AggregateVersion()
  version: number;
}

class SomeEventX {}

class OldEvent {}

class NewEventA {}

class NewEventB {}

class SomeEvent {}

class SomeOtherEvent {}

class Upcaster implements EventUpcaster {
  upcast = jest.fn(json => json);
}

function makeEvents(
  eventType: Type,
  version?: number,
): readonly [EventIdTypeAndData<any>] {
  return [
    {
      eventId: uuid(),
      eventType,
      eventData: {},
      metadata:
        version != null
          ? {
              [DefaultEventSchemaManager.SCHEMA_VERSION]: version,
            }
          : {},
    },
  ];
}

describe('DefaultEventSchemaManager', () => {
  let configuration: ConfigurableEventSchema;
  let eventSchemaManager: DefaultEventSchemaManager;
  let upcasters: readonly EventUpcaster[];
  let unchanged: readonly EventIdTypeAndData<any>[];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AggregateSchemaModule],
    }).compile();

    configuration = module.get(ConfigurableEventSchema);
    eventSchemaManager = module.get(DefaultEventSchemaManager);

    upcasters = Array.from({ length: 5 }).map(() => new Upcaster());
    unchanged = makeEvents(SomeEventX);

    expect(upcasters).toStrictEqual(
      expect.arrayContaining([expect.any(Upcaster)]),
    );

    configuration
      .forAggregate(Account)
      .version(1.0)
      .rename(OldEvent, NewEventA)
      .transform(NewEventA, upcasters[0])
      .transform(NewEventB, upcasters[1])
      .version(2.0)
      .transform(SomeEvent, upcasters[2])
      .transform(NewEventB, upcasters[3])
      .forAggregate(Order)
      .version(1.0)
      .transform(SomeOtherEvent, upcasters[4])
      .customize();
  });

  it('should return latest version', () => {
    expect(eventSchemaManager.currentVersion(Account)).toEqual(2.0);
  });

  it('should return empty for unknown type', () => {
    expect(
      eventSchemaManager.currentVersion(class AccountUnknown {}),
    ).not.toBeDefined();
  });

  it('should upcast and rename', () => {
    const eventsForOldEvent = makeEvents(OldEvent);
    const eventsForOldEventOutcome = makeEvents(
      NewEventA,
      eventSchemaManager.currentVersion(Account),
    );
    const upcastedEvents = eventSchemaManager.upcastEvents(
      Account,
      eventsForOldEvent,
    );
    expect(upcasters[0].upcast).toHaveBeenCalled();
    expect(upcastedEvents).toStrictEqual(eventsForOldEventOutcome);
  });

  it('should upcast twice', () => {
    const eventsForOldEvent = makeEvents(NewEventB);
    const eventsForOldEventOutcome = makeEvents(
      NewEventB,
      eventSchemaManager.currentVersion(Account),
    );
    const upcastedEvents = eventSchemaManager.upcastEvents(
      Account,
      eventsForOldEvent,
    );
    expect(upcasters[1].upcast).toHaveBeenCalled();
    expect(upcasters[2].upcast).toHaveBeenCalled();
    expect(upcastedEvents).toStrictEqual(eventsForOldEventOutcome);
  });

  it('should upcast once', () => {
    const eventsForOldEvent = makeEvents(NewEventB, 1.0);
    const eventsForOldEventOutcome = makeEvents(
      NewEventB,
      eventSchemaManager.currentVersion(Account),
    );
    const upcastedEvents = eventSchemaManager.upcastEvents(
      Account,
      eventsForOldEvent,
    );
    expect(upcasters[3].upcast).toHaveBeenCalled();
    expect(upcastedEvents).toStrictEqual(eventsForOldEventOutcome);
  });
});
