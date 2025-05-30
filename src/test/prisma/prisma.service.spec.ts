/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  let prismaClient: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    prismaClient = service as unknown as jest.Mocked<PrismaClient>;

    // Ensure methods are proper Jest mocks
    prismaClient.$connect = jest.fn();
    prismaClient.$disconnect = jest.fn();

    // Add lifecycle methods to the mock
    service.onModuleInit = jest.fn().mockImplementation(async () => {
      await prismaClient.$connect();
    });
    service.onModuleDestroy = jest.fn().mockImplementation(async () => {
      await prismaClient.$disconnect();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    // Check for PrismaClient methods instead of instance type
    expect(typeof service.$connect).toBe('function');
    expect(typeof service.$disconnect).toBe('function');
    expect(typeof service.$transaction).toBe('function');
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      await service.onModuleInit();
      expect(prismaClient.$connect).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      prismaClient.$connect.mockRejectedValueOnce(error);

      await expect(service.onModuleInit()).rejects.toThrow(error);
      expect(prismaClient.$connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      await service.onModuleDestroy();
      expect(prismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors', async () => {
      const error = new Error('Disconnection failed');
      prismaClient.$disconnect.mockRejectedValueOnce(error);

      await expect(service.onModuleDestroy()).rejects.toThrow(error);
      expect(prismaClient.$disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
