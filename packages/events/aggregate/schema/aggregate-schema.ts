import { Type } from '@nestjs/common';

import { AggregateRoot } from '../aggregate-root';
import { EventIdTypeAndData, EventMetadata } from '../interfaces';
import { DefaultEventSchemaManager } from './event-schema-manager';
import {
  AggregateSchemaVersion,
  EventUpcaster,
} from './aggregate-schema-version';

export class NewEventAndUpcasters<E> {
  constructor(
    readonly upcasters: readonly EventUpcaster[],
    readonly eventType?: Type<E>,
  ) {}

  isEmpty(): boolean {
    return !this.eventType && !this.upcasters.length;
  }
}

export class AggregateSchema<A extends AggregateRoot> {
  get currentVersion(): number {
    return this.versions[this.versions.length - 1].version;
  }

  constructor(
    readonly aggregateType: Type<A>,
    private readonly versions: readonly AggregateSchemaVersion[],
  ) {}

  private maybeUpcast<E>(
    latestVersion: number,
    event: EventIdTypeAndData<E>,
  ): EventIdTypeAndData<E> {
    const actualVersion = this.eventVersion(event);
    return this.needsUpcast(latestVersion, actualVersion)
      ? this.upcast(event, latestVersion, actualVersion)
      : event;
  }

  private upcast<E>(
    event: EventIdTypeAndData<E>,
    toVersion: number,
    fromVersion: number,
  ): EventIdTypeAndData<E> {
    const originalEventType = event.eventType;
    const newEventTypeAndUpcasters = this.findUpcasters(
      originalEventType,
      fromVersion,
      toVersion,
    );

    if (newEventTypeAndUpcasters.isEmpty()) return event;

    const eventData = newEventTypeAndUpcasters.upcasters.reduce(
      (json, upcaster) => upcaster.upcast(json),
      event.eventData,
    );
    const metadata = this.withNewVersion(this.currentVersion, event.metadata);

    return {
      ...event,
      eventType: newEventTypeAndUpcasters.eventType || originalEventType,
      metadata,
      eventData,
    };
  }

  private findUpcasters<E>(
    eventType: Type<E>,
    fromVersion: number,
    toVersion: number,
  ): NewEventAndUpcasters<E> {
    const originalEventType = eventType;
    let versionIdx = 0;

    // while (
    //   fromVersion != null &&
    //   this.versions[versionIdx++]?.version !== fromVersion
    // ) {
    //   console.log('keep looking', fromVersion, versionIdx);
    //   break;
    //   // keep looking
    // }

    const upcasters: EventUpcaster[] = [];

    for (; versionIdx < this.versions.length; versionIdx++) {
      const aggregateSchemaVersion = this.versions[versionIdx];
      eventType = aggregateSchemaVersion.maybeRename(eventType);

      const upcaster = aggregateSchemaVersion.findUpcaster(eventType);
      if (upcaster) upcasters.push(upcaster);
    }

    return new NewEventAndUpcasters(
      upcasters,
      eventType.name === originalEventType.name ? undefined : eventType,
    );
  }

  private withNewVersion(
    currentVersion: number,
    metadata: EventMetadata = {},
  ): EventMetadata {
    metadata[DefaultEventSchemaManager.SCHEMA_VERSION] = currentVersion;
    return metadata;
  }

  private eventVersion<E>(event: EventIdTypeAndData<E>): number {
    return event.metadata?.[DefaultEventSchemaManager.SCHEMA_VERSION] != null
      ? (event.metadata[DefaultEventSchemaManager.SCHEMA_VERSION] as number)
      : -1;
  }

  private needsUpcast(latestVersion: number, actualVersion: number): boolean {
    return latestVersion !== actualVersion;
  }

  upcastEvents<E>(
    events: readonly EventIdTypeAndData<E>[],
  ): readonly EventIdTypeAndData<E>[] {
    const version = this.currentVersion;
    return events.map(event => this.maybeUpcast(version, event));
  }
}
