import { DuplicateTriggeringEventException } from '../../exceptions';
import { EventAndTrigger } from '../../interfaces';
import {
  EtopEventContext,
  SnapshotTriggeringEvents,
} from '../snapshot-triggering-events';
import { LoadedSnapshot } from '../loaded-snapshot';

describe('SnapshotTriggeringEvents', () => {
  const a_1_98 = new EtopEventContext({
    id: 'eventid',
    topic: 'topica',
    partition: 1,
    offset: BigInt(98),
  });
  const a_1_99 = new EtopEventContext({
    id: 'eventid',
    topic: 'topica',
    partition: 1,
    offset: BigInt(99),
  });
  const a_1_100 = new EtopEventContext({
    id: 'eventid',
    topic: 'topica',
    partition: 1,
    offset: BigInt(100),
  });
  const a_2_99 = new EtopEventContext({
    id: 'eventid',
    topic: 'topica',
    partition: 2,
    offset: BigInt(99),
  });

  it('should not reject different', () => {
    const ste = new SnapshotTriggeringEvents();
    ste.add(a_1_99);
    ste.checkForDuplicateEvent(a_2_99.decode()!);
  });

  it('should not reject greater than', () => {
    const ste = new SnapshotTriggeringEvents();
    ste.add(a_1_99);
    ste.checkForDuplicateEvent(a_1_100.decode()!);
  });

  it('should reject equals', () => {
    const ste = new SnapshotTriggeringEvents();
    ste.add(a_1_99);
    expect(() => ste.checkForDuplicateEvent(a_1_99.decode()!)).toThrowError(
      DuplicateTriggeringEventException,
    );
  });

  it('should reject less than', () => {
    const ste = new SnapshotTriggeringEvents();
    ste.add(a_1_99);
    expect(() => ste.checkForDuplicateEvent(a_1_98.decode()!)).toThrowError(
      DuplicateTriggeringEventException,
    );
  });

  it('should create snapshot triggering events', () => {
    const ste = SnapshotTriggeringEvents.create([]);
    expect(ste.isEmpty()).toBe(true);
  });

  it('should create snapshot triggering events with previous snapshot', () => {
    const ste1 = new SnapshotTriggeringEvents();
    ste1.add(a_1_99);
    const triggeringEvents = ste1.to();

    const previousSnapshot = new LoadedSnapshot(
      undefined as never,
      triggeringEvents,
    );
    const events: readonly EventAndTrigger<any>[] = [
      {
        event: undefined as never,
        triggeringEvent: a_1_100.eventToken,
      },
    ];

    const ste = SnapshotTriggeringEvents.create(
      events,
      a_2_99,
      previousSnapshot,
    );
    expect(ste.isEmpty()).toBe(false);
  });

  it('should serde', () => {});

  it('should serde with events', () => {});
});
