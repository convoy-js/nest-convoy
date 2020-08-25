import { Reply } from '@nest-convoy/common';

export class Success implements Reply {}

export class Failure implements Reply {}

export enum CommandReplyOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}
