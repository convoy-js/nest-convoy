import { Handle } from './handles';

export interface DispatcherFactory<D, H extends Handle<any>> {
  create(id: string, handlers: H): D;
}
