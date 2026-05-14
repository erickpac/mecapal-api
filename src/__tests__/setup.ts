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

// AWS S3 test environment
process.env.AWS_S3_REGION = 'us-east-1';
process.env.AWS_S3_BUCKET = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key-id';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-access-key';

// AWS CloudFront test environment (required by S3Service.getOrThrow)
process.env.AWS_CLOUDFRONT_DOMAIN = 'test.cloudfront.net';
