export const NEST_CONVOY_CONNECTION = 'NestConvoyConnection';
// TODO: Somehow Eventuate CDC doesn't support specifying schema
export const NEST_CONVOY_SCHEMA = process.env.CONVOY_SCHEMA || 'eventuate';

export const NEST_CONVOY_ASYNC_LOCAL_STORAGE = Symbol(
  'NEST_CONVOY_ASYNC_LOCAL_STORAGE',
);
