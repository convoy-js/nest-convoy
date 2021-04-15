export interface DecodedEtpoContext {
  readonly id: string;
  readonly topic: string;
  readonly partition: number;
  readonly offset: bigint;
}

export class EtpoEventContext {
  static readonly PREFIX = 'etpo:';

  readonly eventToken: string;

  constructor({ id, topic, partition, offset }: DecodedEtpoContext) {
    this.eventToken = `${EtpoEventContext.PREFIX}${id}:${topic}:${partition}:${offset}`;
  }

  decode(): DecodedEtpoContext | undefined {
    return EtpoEventContext.decode(this);
  }

  static decode(
    triggeringEvent: EtpoEventContext | string,
  ): DecodedEtpoContext | undefined {
    triggeringEvent =
      triggeringEvent instanceof EtpoEventContext
        ? triggeringEvent.eventToken
        : triggeringEvent;

    if (EtpoEventContext.isEtpoEvent(triggeringEvent)) {
      const elements = triggeringEvent
        .substring(EtpoEventContext.PREFIX.length)
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
    return !!triggeringEvent?.startsWith(EtpoEventContext.PREFIX);
  }
}
