import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { Logger } from '@nestjs/common';

describe('PrismaService', () => {
  let service: PrismaService;
  let connectSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);

    // Mock the PrismaClient methods directly on the service
    const connectMethod = '$connect' as const;
    const disconnectMethod = '$disconnect' as const;
    connectSpy = jest
      .spyOn(service, connectMethod)
      .mockResolvedValue(undefined);
    disconnectSpy = jest
      .spyOn(service, disconnectMethod)
      .mockResolvedValue(undefined);
    service['$transaction'] = jest.fn();

    // Mock the logger to avoid actual logging in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should extend PrismaClient functionality', () => {
      expect(typeof service.$connect).toBe('function');
      expect(typeof service.$disconnect).toBe('function');
      expect(typeof service.$transaction).toBe('function');
    });
  });

  describe('onModuleInit', () => {
    it('should call $connect when module initializes', async () => {
      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors gracefully', async () => {
      const error = new Error('Connection failed');
      // Mock all retry attempts to fail (maxRetries = 2)
      connectSpy.mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(connectSpy).toHaveBeenCalledTimes(2);
    });

    it('should complete successfully when connection works', async () => {
      connectSpy.mockResolvedValueOnce(undefined);

      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect when module is destroyed', async () => {
      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors gracefully', async () => {
      const error = new Error('Disconnection failed');
      disconnectSpy.mockRejectedValueOnce(error);

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should complete successfully when disconnection works', async () => {
      disconnectSpy.mockResolvedValueOnce(undefined);

      await expect(service.onModuleDestroy()).resolves.not.toThrow();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logger integration', () => {
    it('should initialize without throwing logger-related errors', async () => {
      // This implicitly tests that the logger was created successfully in the constructor
      await expect(service.onModuleInit()).resolves.not.toThrow();
    });
  });
});
