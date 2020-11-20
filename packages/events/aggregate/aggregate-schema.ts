import { Type } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';
import { EventIdTypeAndData } from './interfaces';
import { DefaultEventSchemaManager } from './crud/event-schema-manager';
import {
  AggregateSchemaVersion,
  EventUpcaster,
} from './aggregate-schema-version';

export class NewEventNameAndUpcasters<E> {
  constructor(
    readonly upcasters: readonly EventUpcaster[],
    readonly eventType?: Type<E>,
  ) {}

  isEmpty(): boolean {
    return !this.eventType && !this.upcasters.length;
  }
}

export class AggregateSchema<A extends AggregateRoot> {
  get currentVersion(): string {
    return this.versions[this.versions.length - 1].version;
  }

  constructor(
    readonly aggregateType: Type<A>,
    private readonly versions: readonly AggregateSchemaVersion[],
  ) {}

  private maybeUpcast<E>(
    latestVersion: string,
    event: EventIdTypeAndData<E>,
  ): EventIdTypeAndData<E> {
    const actualVersion = this.eventVersion(event);
    return this.needsUpcast(latestVersion, actualVersion)
      ? this.upcast(event, actualVersion, latestVersion)
      : event;
  }

  private upcast<E>(
    event: EventIdTypeAndData<E>,
    fromVersion: string,
    toVersion: string,
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
    fromVersion: string,
    toVersion: string,
  ): NewEventNameAndUpcasters<E> {
    const originalEventType = eventType;
    const upcasters: EventUpcaster[] = [];

    for (let versionIdx = 0; versionIdx < this.versions.length; versionIdx++) {
      const aggregateSchemaVersion = this.versions[versionIdx];
      eventType = aggregateSchemaVersion.maybeRename(eventType);

      const upcaster = aggregateSchemaVersion.findUpcaster(eventType);
      if (upcaster) upcasters.push(upcaster);
    }

    return new NewEventNameAndUpcasters(
      upcasters,
      eventType.name === originalEventType.name ? undefined : eventType,
    );
  }

  private withNewVersion(
    currentVersion: string,
    metadata: Record<string, string>,
  ): Record<string, string> {
    metadata[DefaultEventSchemaManager.EVENT_SCHEMA_VERSION] = currentVersion;
    return metadata;
  }

  private eventVersion<E>(event: EventIdTypeAndData<E>): string {
    return event.metadata[DefaultEventSchemaManager.EVENT_SCHEMA_VERSION];
  }

  private needsUpcast(latestVersion: string, actualVersion: string): boolean {
    return latestVersion !== actualVersion;
  }

  upcastEvents<E>(
    events: readonly EventIdTypeAndData<E>[],
  ): readonly EventIdTypeAndData<E>[] {
    return events.map(event => this.maybeUpcast(this.currentVersion, event));
  }
}
