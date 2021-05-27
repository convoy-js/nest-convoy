import { DatabaseTransactionContext } from './database-transaction-context';

export function Transactional(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function <T>(...args: any[]): Promise<T> {
      return DatabaseTransactionContext.create(() =>
        originalMethod.apply(this, args),
      );
    };
    return descriptor;
  };
}
