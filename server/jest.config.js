module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  testMatch: ['**/tests/**/*.test.js'],
};
