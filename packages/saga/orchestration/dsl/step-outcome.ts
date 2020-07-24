export abstract class StepOutcome {
  abstract visit(localConsumer: any, commandsConsumer: any): void;
}

export class LocalStepOutcome extends StepOutcome {
  visit(localConsumer: any, commandsConsumer: any): void {}
}

export class RemoteStepOutcome extends StepOutcome {
  visit(localConsumer: any, commandsConsumer: any): void {}
}
