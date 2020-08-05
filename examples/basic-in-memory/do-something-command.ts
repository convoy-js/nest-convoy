export class DoSomethingCommand {
  constructor(readonly now = Date.now()) {}
}
