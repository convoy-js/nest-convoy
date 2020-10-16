import { Type } from '@nestjs/common';

import {
  AggregateSchemaVersion,
  EventUpcaster,
} from './aggregate-schema-version';
import { AggregateRoot } from './aggregate-root';
import { EventIdTypeAndData, EventTypeAndData } from './event-with-metadata';
import { DefaultEventSchemaManager } from './event-schema-manager';

class NewEventNameAndUpcasters<E> {
  constructor(
    readonly upcasters: EventUpcaster[],
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
    private readonly versions: AggregateSchemaVersion[],
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

    const json = newEventTypeAndUpcasters.upcasters.reduce(
      (json, upcaster) => upcaster.upcast(json),
      JSON.parse(event.eventData),
    );

    return new EventIdTypeAndData(
      event.id,
      new EventTypeAndData(
        newEventTypeAndUpcasters.eventType || originalEventType,
        JSON.stringify(json),
        this.withNewVersion(this.currentVersion, event.metadata),
      ),
    );
  }

  private findUpcasters<E>(
    eventType: Type<E>,
    fromVersion: string,
    toVersion: string,
  ): NewEventNameAndUpcasters<E> {
    let originalEventType = eventType;

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
    metadata?: string,
  ): string | undefined {
    const md = metadata ? JSON.parse(metadata) : {};
    md[DefaultEventSchemaManager.EVENT_SCHEMA_VERSION] = currentVersion;
    return JSON.stringify(md);
  }

  private eventVersion<E>(event: EventIdTypeAndData<E>): string {
    const md = event.metadata ? JSON.parse(event.metadata) : {};
    return md[DefaultEventSchemaManager.EVENT_SCHEMA_VERSION];
  }

  private needsUpcast(latestVersion: string, actualVersion: string): boolean {
    return latestVersion !== actualVersion;
  }

  upcastEvents<E>(events: EventIdTypeAndData<E>[]): EventIdTypeAndData<E>[] {
    return events.map(event => this.maybeUpcast(this.currentVersion, event));
  }
}
