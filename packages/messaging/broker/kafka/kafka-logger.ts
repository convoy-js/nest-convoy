import { LogEntry, logLevel } from 'kafkajs';
import { Logger } from '@nestjs/common';

export const KafkaLogger = (logger: Logger) => ({
  namespace,
  level,
  label,
  log: { message, ...others },
}: LogEntry) => {
  let method: keyof Logger;

  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      method = 'error';
      break;
    case logLevel.WARN:
      method = 'warn';
      break;
    case logLevel.INFO:
      method = 'log';
      break;
    case logLevel.DEBUG:
    default:
      method = 'debug';
      break;
  }

  logger[method]?.(
    `${label} [${namespace}] ${message} ${JSON.stringify(others)}`,
  );
};
