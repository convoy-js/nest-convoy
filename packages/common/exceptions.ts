import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

export class UnsupportedOperationException extends RuntimeException {}

export { RuntimeException };
