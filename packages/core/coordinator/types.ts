import type { KafkaConfig } from 'kafkajs';

import type { Action } from '../types';

export interface NestSagaCoordinatorOptions {}

export interface NestSagaCoordinatorModuleOptions extends KafkaConfig {
  actions: Action[];
}
