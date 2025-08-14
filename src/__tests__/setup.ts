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

// Mock PrismaService
jest.mock('../modules/prisma/prisma.service', () => {
  type PrismaModel = {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };

  type PrismaClient = {
    [key: string]: PrismaModel | jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $transaction: jest.Mock;
  };

  const createModelMock = (): PrismaModel => ({
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  });

  const mockPrismaService: PrismaClient = {
    user: createModelMock(),
    // Add more models here as needed
    // example: product: createModelMock(),
    // example: order: createModelMock(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((callback: (tx: PrismaClient) => Promise<unknown>) =>
      Promise.resolve(callback(mockPrismaService)),
    ),
  };

  return {
    PrismaService: jest.fn(() => mockPrismaService),
  };
});

// Global test environment setup
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.RESEND_API_KEY = 'RESEND_API_KEY';
process.env.CLOUDINARY_CLOUD_NAME = 'CLOUDINARY_CLOUD_NAME';
process.env.CLOUDINARY_API_KEY = 'CLOUDINARY_API_KEY';
process.env.CLOUDINARY_API_SECRET = 'CLOUDINARY_API_SECRET';
process.env.DATABASE_URL = 'DATABASE_URL';
process.env.JWT_SECRET = 'JWT_SECRET';
