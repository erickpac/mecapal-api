process.loadEnvFile();

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
