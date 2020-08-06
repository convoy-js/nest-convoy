import { Consumer } from '@nest-convoy/common';

import { KafkaMessage } from './kafka-message';

export type KafkaMessageHandler = Consumer<KafkaMessage>;
