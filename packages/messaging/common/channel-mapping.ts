import { Injectable } from '@nestjs/common';

@Injectable()
export class ConvoyChannelMapping {
  private readonly mappings = new Map<string, string>();

  with(from: string, to: string): this {
    this.mappings.set(from, to);
    return this;
  }

  transform(channel: string): string {
    return this.mappings.get(channel) ?? channel;
  }
}
