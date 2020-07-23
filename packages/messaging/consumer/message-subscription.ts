import { Subscriber } from 'rxjs';

export type MessageSubscription<T = any> = Subscriber<T>;
