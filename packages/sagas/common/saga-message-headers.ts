import { MessageHeaders } from '@nest-convoy/messaging';

import { SagaCommandHeaders } from './saga-command-headers';

export class SagaMessageHeaders extends MessageHeaders {
  constructor(sagaType: string, sagaId: string) {
    super();

    this.set(SagaCommandHeaders.SAGA_TYPE, sagaType);
    this.set(SagaCommandHeaders.SAGA_ID, sagaId);
  }
}
