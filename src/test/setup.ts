process.loadEnvFile();

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock env config
jest.mock('../config/env.config', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_EXPIRATION_TIME: '1h',
    JWT_REFRESH_EXPIRATION_TIME: '7d',
  },
}));
