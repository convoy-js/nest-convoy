export interface Outcome {}

export class Success implements Outcome {}

export class Failure implements Outcome {}

export enum CommandReplyOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}
