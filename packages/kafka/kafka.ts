import {
  Consumer,
  ConsumerGroupJoinEvent,
  Kafka as KafkaClient,
  KafkaConfig,
  PartitionAssigner,
  Producer,
} from 'kafkajs';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { KAFKA_CONFIG } from './tokens';
import { KafkaLogger } from './kafka-logger';

export type ConsumerAssignments = Record<string, number>;
export const GROUP_ID = 'nest-convoy';

@Injectable()
export class Kafka {
  private readonly logger = new Logger(this.constructor.name);
  private readonly kafka = new KafkaClient({
    ...this.config,
    logCreator: KafkaLogger.bind(null, this.logger),
  });
  private consumerAssignments: ConsumerAssignments = {};

  readonly producer: Producer = this.kafka.producer({
    idempotent: true,
    allowAutoTopicCreation: true,
  });
  readonly consumer: Consumer = this.kafka.consumer({
    groupId: this.config.clientId || GROUP_ID,
    allowAutoTopicCreation: true,
  });

  constructor(
    @Inject(KAFKA_CONFIG)
    private readonly config: KafkaConfig,
  ) {
    // set member assignments on join and rebalance
    // this.consumer.on(
    //   this.consumer.events.GROUP_JOIN,
    //   this.setConsumerAssignments.bind(this),
    // );
  }

  private setConsumerAssignments(data: ConsumerGroupJoinEvent): void {
    // only need to set the minimum
    this.consumerAssignments = Object.keys(
      data.payload.memberAssignment,
    ).reduce((consumerAssignments, memberId) => {
      const minimumPartition = Math.min(
        ...data.payload.memberAssignment[memberId],
      );

      return {
        [memberId]: minimumPartition,
        ...consumerAssignments,
      };
    }, {} as ConsumerAssignments);
  }

  getPreviousAssignments(): ConsumerAssignments {
    return this.consumerAssignments;
  }
}
