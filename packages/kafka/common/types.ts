import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

export interface NestConvoyKafkaMessagingModuleOptions {
  client: KafkaConfig;
  consumer?: KafkaMessagingConsumerModuleOptions;
  producer?: ProducerConfig;
}

export interface KafkaMessagingConsumerModuleOptions
  extends Pick<
    ConsumerConfig,
    'heartbeatInterval' | 'retry' | 'maxInFlightRequests'
  > {}
