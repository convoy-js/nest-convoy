import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export class UnsupportedOperationException extends RuntimeException {}

export class IllegalArgumentException extends RuntimeException {}

export { RuntimeException };
