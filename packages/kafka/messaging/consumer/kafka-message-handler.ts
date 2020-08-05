import { Consumer } from '@nest-convoy/core';

import { KafkaMessage } from './kafka-message';

export type KafkaMessageHandler = Consumer<KafkaMessage>;
