import { EntityProperty, Platform, Type } from '@mikro-orm/core';

import { DuplicateTriggeringEventException } from '../exceptions';
import { EventAndTrigger } from '../interfaces';
import { LoadedSnapshot } from './loaded-snapshot';
import { Snapshot } from './snapshot-strategy';
import { DecodedEtpoContext, EtpoEventContext } from './etpo-event-context';

export class SnapshotTriggeringEventsType extends Type<
  SnapshotTriggeringEvents,
  readonly string[]
> {
  getColumnType(prop: EntityProperty, platform: Platform): string {
    return platform.getArrayDeclarationSQL();
  }

  convertToJSValue(value: readonly string[]): SnapshotTriggeringEvents {
    return new SnapshotTriggeringEvents(value);
  }

  convertToDatabaseValue(value: SnapshotTriggeringEvents): readonly string[] {
    return value.serialize();
  }
}

export class SnapshotTriggeringEvents {
  static checkSnapshotForDuplicateEvent(
    previousSnapshot: LoadedSnapshot<any>,
    eventContext: EtpoEventContext,
  ): void {
    if (previousSnapshot.triggeringEvents) {
      const tpo = EtpoEventContext.decode(eventContext.eventToken);
      if (tpo) {
        const ste = new SnapshotTriggeringEvents(
          previousSnapshot.triggeringEvents,
        );
        ste.checkForDuplicateEvent(tpo);
      }
    }
  }

  static create<S extends Snapshot>(
    events: readonly EventAndTrigger<any>[],
    eventContext?: EtpoEventContext,
    previousSnapshot?: LoadedSnapshot<S>,
  ): SnapshotTriggeringEvents {
    const ste = new SnapshotTriggeringEvents(
      previousSnapshot?.triggeringEvents,
    );

    events
      .filter(e => EtpoEventContext.isEtpoEvent(e.triggeringEvent))
      .forEach(e => ste.add(e.triggeringEvent));

    if (EtpoEventContext.isEtpoEvent(eventContext?.eventToken)) {
      ste.add(eventContext!.eventToken);
    }

    return ste;
  }

  private readonly topicPartitionOffsets = new Map<
    string,
    Map<number, bigint>
  >();

  constructor(triggeringEvents?: readonly string[]) {
    triggeringEvents?.forEach(e => this.add(e));
  }

  isEmpty(): boolean {
    return this.topicPartitionOffsets.size < 1;
  }

  serialize(): readonly string[] {
    return [...this.topicPartitionOffsets.entries()].flatMap(
      ([topic, po]): string[] =>
        [...po.entries()].map(
          ([partition, offset]) =>
            new EtpoEventContext({
              id: '????',
              topic,
              partition,
              offset,
            }).eventToken,
        ),
    );
  }

  add(triggeringEvent: EtpoEventContext | string): this {
    triggeringEvent =
      triggeringEvent instanceof EtpoEventContext
        ? triggeringEvent.eventToken
        : triggeringEvent;

    const { topic, partition, offset } =
      EtpoEventContext.decode(triggeringEvent)!;
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
  }: DecodedEtpoContext): void {
    const pos = this.topicPartitionOffsets.get(topic);
    const maxOffset = pos?.get(partition);

    if (maxOffset != null && offset <= maxOffset) {
      throw new DuplicateTriggeringEventException();
    }
  }
}
