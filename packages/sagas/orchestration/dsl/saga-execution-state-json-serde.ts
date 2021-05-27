import { SagaExecutionState } from '../saga-execution-state';

export function decodeExecutionState(currentState: string): SagaExecutionState {
  return Object.assign(
    new SagaExecutionState(),
    JSON.parse(currentState) as SagaExecutionState,
  );
}

export function encodeExecutionState(state: SagaExecutionState): string {
  return JSON.stringify(state);
}

// export class SagaExecutionStateJsonSerde {
//   static decodeState(currentState: string): SagaExecutionState {
//     return Object.assign(new SagaExecutionState(), JSON.parse(currentState));
//   }
//
//   static encodeState(state: SagaExecutionState): string {
//     return JSON.stringify(state);
//   }
// }
