// Global mock cleanup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Global test environment setup
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'DATABASE_URL';

// AWS Cognito test environment
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_COGNITO_USER_POOL_ID = 'us-east-1_testpool';
process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';
