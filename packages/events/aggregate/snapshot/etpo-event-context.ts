export interface DecodedEtpoContext {
  readonly id: string;
  readonly topic: string;
  readonly partition: number;
  readonly offset: bigint;
}

export class EtpoEventContext {
  static readonly PREFIX = 'etpo:';

  static isEtpoEvent(triggeringEvent?: string): boolean {
    return !!triggeringEvent?.startsWith(EtpoEventContext.PREFIX);
  }

  static decode(
    triggeringEvent: EtpoEventContext | string,
  ): DecodedEtpoContext | undefined {
    triggeringEvent =
      triggeringEvent instanceof EtpoEventContext
        ? triggeringEvent.eventToken
        : triggeringEvent;

    if (EtpoEventContext.isEtpoEvent(triggeringEvent)) {
      const [id, topic, partition, offset] = triggeringEvent
        .substring(EtpoEventContext.PREFIX.length)
        .split(':');

      return {
        partition: parseInt(partition),
        offset: BigInt(offset),
        id,
        topic,
      };
    }
  }

  readonly eventToken: string;

  constructor({ id, topic, partition, offset }: DecodedEtpoContext) {
    this.eventToken = `${EtpoEventContext.PREFIX}${id}:${topic}:${partition}:${offset}`;
  }

  decode(): DecodedEtpoContext | undefined {
    return EtpoEventContext.decode(this);
  }
}
