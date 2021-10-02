module.exports = {
  testEnvironment: 'node',
  testTimeout: 180000, // three minutes timeout for all tests
  collectCoverage: true,
  coverageReporters: ['lcov'],
  coverageDirectory: './test/coverage',
};
