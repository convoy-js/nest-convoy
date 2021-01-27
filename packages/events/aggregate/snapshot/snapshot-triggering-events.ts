import { DuplicateTriggeringEventException } from '../exceptions';
import { EventContext } from '../event-context';
import { EventAndTrigger } from '../interfaces';

// ????
import { LoadedSnapshot } from './loaded-snapshot';
import { Snapshot } from './snapshot-strategy';

export interface DecodedEtopContext {
  readonly id: string;
  readonly topic: string;
  readonly partition: number;
  readonly offset: bigint;
}

export class EtopEventContext {
  static readonly PREFIX = 'etpo:';

  readonly eventToken: string;

  constructor({ id, topic, partition, offset }: DecodedEtopContext) {
    this.eventToken = `${EtopEventContext.PREFIX}${id}:${topic}:${partition}:${offset}`;
  }

  decode(): DecodedEtopContext | undefined {
    return EtopEventContext.decode(this);
  }

  static decode(
    triggeringEvent: EtopEventContext | string,
  ): DecodedEtopContext | undefined {
    triggeringEvent =
      triggeringEvent instanceof EtopEventContext
        ? triggeringEvent.eventToken
        : triggeringEvent;

    if (EtopEventContext.isEtpoEvent(triggeringEvent)) {
      const elements = triggeringEvent
        .substring(EtopEventContext.PREFIX.length)
        .split(':');

      return {
        id: elements[0],
        topic: elements[1],
        partition: parseInt(elements[2]),
        offset: BigInt(elements[3]),
      };
    }
  }

  static isEtpoEvent(triggeringEvent?: string): boolean {
    return !!triggeringEvent?.startsWith(EtopEventContext.PREFIX);
  }
}

export class SnapshotTriggeringEvents {
  private readonly topicPartitionOffsets = new Map<
    string,
    Map<number, bigint>
  >();

  constructor(triggeringEvents?: readonly string[]) {
    triggeringEvents?.forEach(e => this.add(e));
  }

  static checkSnapshotForDuplicateEvent(
    previousSnapshot: LoadedSnapshot<any>,
    eventContext: EtopEventContext,
  ): void {
    if (previousSnapshot.triggeringEvents) {
      const etop = EtopEventContext.decode(eventContext.eventToken);
      if (etop) {
        const ste = new SnapshotTriggeringEvents(
          previousSnapshot.triggeringEvents,
        );
        ste.checkForDuplicateEvent(etop);
      }
    }
  }

  static create<S extends Snapshot>(
    events: readonly EventAndTrigger<any>[],
    eventContext?: EtopEventContext,
    previousSnapshot?: LoadedSnapshot<S>,
  ): SnapshotTriggeringEvents {
    const ste = new SnapshotTriggeringEvents(
      previousSnapshot?.triggeringEvents,
    );

    events
      .filter(e => EtopEventContext.isEtpoEvent(e.triggeringEvent))
      .forEach(e => ste.add(e.triggeringEvent));

    if (EtopEventContext.isEtpoEvent(eventContext?.eventToken)) {
      ste.add(eventContext!.eventToken);
    }

    return ste;
  }

  isEmpty(): boolean {
    return this.topicPartitionOffsets.size < 1;
  }

  to(): readonly string[] {
    return [...this.topicPartitionOffsets.entries()].flatMap(
      ([topic, po]): string[] =>
        [...po.entries()].map(
          ([partition, offset]) =>
            new EtopEventContext({
              id: '????',
              topic,
              partition,
              offset,
            }).eventToken,
        ),
    );
  }

  add(triggeringEvent: EtopEventContext | string): this {
    triggeringEvent =
      triggeringEvent instanceof EtopEventContext
        ? triggeringEvent.eventToken
        : triggeringEvent;

    const { topic, partition, offset } = EtopEventContext.decode(
      triggeringEvent,
    )!;
    const pos = this.topicPartitionOffsets.get(topic);

    if (pos == null) {
      this.topicPartitionOffsets.set(topic, new Map([[partition, offset]]));
    } else {
      const maxOffset = pos.get(partition);
      if (maxOffset == null || offset > maxOffset) {
        pos.set(partition, offset);
      }
    }

    return this;
  }

  checkForDuplicateEvent({
    topic,
    partition,
    offset,
  }: DecodedEtopContext): void {
    const pos = this.topicPartitionOffsets.get(topic);
    const maxOffset = pos?.get(partition);

    if (maxOffset != null && offset <= maxOffset) {
      throw new DuplicateTriggeringEventException();
    }
  }
}
