import { Command } from '@nest-convoy/commands/common';

import { CommandEndpoint } from './command-endpoint';
import {
  Compensation,
  CompensationPredicate,
  WithCompensationBuilder,
} from './with-compensation-builder';

export class InvokeParticipantStepBuilder<Data>
  implements WithCompensationBuilder<Data> {
  constructor(private readonly parent: any) {}

  withCompensation(
    compensationPredicate: CompensationPredicate<Data>,
    compensation: Compensation<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation(
    compensation: Compensation<Data>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation<C extends Command>(
    compensationPredicate: CompensationPredicate<Data>,
    commandEndpoint: CommandEndpoint<C>,
    commandProvider: Compensation<Data, C>,
  ): InvokeParticipantStepBuilder<Data>;
  withCompensation(
    compensationPredicate,
    compensation?,
    commandProvider?,
  ): InvokeParticipantStepBuilder<Data> {
    return undefined;
  }
}
