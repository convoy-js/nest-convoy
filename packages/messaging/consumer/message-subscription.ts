export type MessageSubscription = Promise<() => Promise<void> | void>;
