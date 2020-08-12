import { RuntimeException } from '@nest-convoy/common';

export class CustomerNotFoundException extends RuntimeException {}

export class CustomerCreditLimitExceededException extends RuntimeException {}
