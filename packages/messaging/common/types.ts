import { Consumer } from '@nest-convoy/common';

import { Message } from './message';

export type MessageHandler = Consumer<Message, void>;
