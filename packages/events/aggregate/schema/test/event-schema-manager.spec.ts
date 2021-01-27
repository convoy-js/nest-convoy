import { Test } from '@nestjs/testing';
import type { ObjectLiteral } from '@nest-convoy/common';

import { AggregateRoot } from '../../aggregate-root';
import { AggregateSchemaModule } from '../aggregate-schema.module';
import { ConfigurableEventSchema } from '../configurable-event-schema';
import { EventUpcaster } from '../aggregate-schema-version';

class Account extends AggregateRoot {}

class Order extends AggregateRoot {}

describe('DefaultEventSchemaManager', () => {
  let configuration: ConfigurableEventSchema;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AggregateSchemaModule],
    }).compile();

    configuration = module.get(ConfigurableEventSchema);

    class Upcaster1 implements EventUpcaster {
      upcast(json: ObjectLiteral): ObjectLiteral {
        return json;
      }
    }

    configuration
      .forAggregate(Account)
      .version(1.0)
      .rename('OldEventName', class NewEventA {})
      .transform('NewEventNameA', new Upcaster1())
      .transform('NewEventNameB', new Upcaster1())
      .version(2.0)
      .transform('SomeEvent', new Upcaster1())
      .transform('NewEventNameB', new Upcaster1())
      .forAggregate(Order)
      .version(1.0)
      .transform('SomeOtherEventName', new Upcaster1())
      .customize();
  });
});
