module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.js'],
  // setupFilesAfterEnv: ['jest-extended'],
  collectCoverage: true,
  coverageDirectory: process.env['TEST_UNDECLARED_OUTPUTS_DIR'],
  moduleNameMapper: {
    '@nest-convoy/(.*)': '<rootDir>/packages/$1',
    'nest_convoy/(.*)': '<rootDir>/$1',
  },
};
