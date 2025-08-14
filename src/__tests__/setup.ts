// Global mock cleanup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Global test environment setup
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.RESEND_API_KEY = 'RESEND_API_KEY';
process.env.CLOUDINARY_CLOUD_NAME = 'CLOUDINARY_CLOUD_NAME';
process.env.CLOUDINARY_API_KEY = 'CLOUDINARY_API_KEY';
process.env.CLOUDINARY_API_SECRET = 'CLOUDINARY_API_SECRET';
process.env.DATABASE_URL = 'DATABASE_URL';
process.env.JWT_SECRET = 'JWT_SECRET';
