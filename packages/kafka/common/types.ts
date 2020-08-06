import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

export interface ConvoyKafkaMessagingModuleOptions {
  client: KafkaConfig;
  consumer?: KafkaMessagingConsumerModuleOptions;
  producer?: ProducerConfig;
}

export interface KafkaMessagingConsumerModuleOptions
  extends Pick<
    ConsumerConfig,
    'heartbeatInterval' | 'retry' | 'maxInFlightRequests'
  > {}
