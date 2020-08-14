import {
  CommandHandlers,
  CommandHandler,
} from '@nest-convoy/commands/consumer';

describe('CommandHandlers', () => {
  describe('getChannels', () => {
    it('should return command handler channels', () => {
      class TestCommand {}

      const commandHandlers = new CommandHandlers([
        new CommandHandler('one', TestCommand, jest.fn()),
        new CommandHandler('two', TestCommand, jest.fn()),
      ]);

      expect(commandHandlers.getChannels()).toEqual(['one', 'two']);
    });
  });
});
