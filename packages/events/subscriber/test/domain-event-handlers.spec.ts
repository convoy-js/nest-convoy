import { DomainEventHandlers } from '../domain-event-handlers';
import { DomainEventHandler } from '../domain-event-handler';

describe('DomainEventHandlers', () => {
  let domainEventHandlers: DomainEventHandlers;

  class TestEvent {}

  class AggregateType {}

  describe('getAggregateTypesAndEvents', () => {
    it('should return correct results', () => {
      domainEventHandlers = new DomainEventHandlers([
        new DomainEventHandler(TestEvent, jest.fn(), AggregateType.name),
      ]);

      expect(domainEventHandlers.getAggregateTypesAndEvents()).toEqual([
        AggregateType.name,
        TestEvent.name,
      ]);
    });
  });
});
