import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const mockPoolEnd = jest.fn().mockResolvedValue(undefined);
const mockClientQuery = jest.fn();
const mockClientRelease = jest.fn();
const mockPoolConnect = jest.fn().mockResolvedValue({
  query: mockClientQuery,
  release: mockClientRelease,
});

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: mockPoolConnect,
    end: mockPoolEnd,
  })),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({
    provider: 'postgres',
    adapterName: '@prisma/adapter-pg',
    connect: jest.fn(),
    connectToShadowDb: jest.fn(),
  })),
}));

const PoolMock = Pool as unknown as jest.Mock;
const PrismaPgMock = PrismaPg as unknown as jest.Mock;

import { PrismaService } from '../prisma.service';

const buildConfigServiceMock = (databaseUrl: string): ConfigService =>
  ({
    get: jest.fn((key: string, defaultValue?: unknown) =>
      key === 'DATABASE_URL' ? databaseUrl : defaultValue,
    ),
  }) as unknown as ConfigService;

describe('PrismaService', () => {
  let service: PrismaService;
  let connectSpy: jest.SpyInstance;
  let disconnectSpy: jest.SpyInstance;

  beforeEach(async () => {
    PoolMock.mockClear();
    PrismaPgMock.mockClear();
    mockPoolEnd.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: buildConfigServiceMock(
            'postgresql://user:pass@localhost:5432/mekapal',
          ),
        },
      ],
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

    it('should construct a pg Pool and PrismaPg adapter', () => {
      expect(PoolMock).toHaveBeenCalledTimes(1);
      expect(PrismaPgMock).toHaveBeenCalledTimes(1);
    });

    it('should expose withAdvisoryLock', () => {
      expect(typeof service.withAdvisoryLock).toBe('function');
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

    it('should close the pg pool on destroy', async () => {
      await service.onModuleDestroy();

      expect(mockPoolEnd).toHaveBeenCalledTimes(1);
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

  describe('SSL configuration', () => {
    type LastPoolConfig = {
      connectionString?: string;
      max?: number;
      ssl?: { rejectUnauthorized: boolean };
    };

    const lastPoolConfig = (): LastPoolConfig => {
      const calls = PoolMock.mock.calls as unknown[][];
      const last = calls[calls.length - 1];
      return last[0] as LastPoolConfig;
    };

    it('should default to rejectUnauthorized=false when sslmode is missing', () => {
      PoolMock.mockClear();

      new PrismaService(
        buildConfigServiceMock('postgresql://user:pass@localhost:5432/mekapal'),
      );

      const config = lastPoolConfig();
      expect(config.ssl).toEqual({ rejectUnauthorized: false });
      expect(config.max).toBe(10);
    });

    it('should respect sslmode when present in the URL', () => {
      PoolMock.mockClear();

      new PrismaService(
        buildConfigServiceMock(
          'postgresql://user:pass@localhost:5432/mekapal?sslmode=require',
        ),
      );

      const config = lastPoolConfig();
      expect(config.ssl).toBeUndefined();
    });

    it('should fall back to rejectUnauthorized=false when DATABASE_URL is not a URL', () => {
      PoolMock.mockClear();

      new PrismaService(buildConfigServiceMock('not-a-url'));

      const config = lastPoolConfig();
      expect(config.ssl).toEqual({ rejectUnauthorized: false });
    });
  });

  describe('withAdvisoryLock', () => {
    beforeEach(() => {
      mockClientQuery.mockReset();
      mockClientRelease.mockReset();
      mockPoolConnect.mockClear();
    });

    it('should run fn and unlock on the same pool connection when lock is acquired', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ locked: true }] })
        .mockResolvedValueOnce({ rows: [] });

      const fn = jest.fn().mockResolvedValue('done');

      const result = await service.withAdvisoryLock(42, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(mockPoolConnect).toHaveBeenCalledTimes(1);
      expect(mockClientQuery).toHaveBeenCalledTimes(2);
      expect(mockClientQuery).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('pg_try_advisory_lock'),
        [42],
      );
      expect(mockClientQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('pg_advisory_unlock'),
        [42],
      );
      expect(mockClientRelease).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ acquired: true, result: 'done' });
    });

    it('should skip fn and release the connection when lock is not acquired', async () => {
      mockClientQuery.mockResolvedValueOnce({ rows: [{ locked: false }] });

      const fn = jest.fn();

      const result = await service.withAdvisoryLock(42, fn);

      expect(fn).not.toHaveBeenCalled();
      expect(mockPoolConnect).toHaveBeenCalledTimes(1);
      expect(mockClientQuery).toHaveBeenCalledTimes(1);
      expect(mockClientRelease).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ acquired: false });
    });

    it('should release the connection even if fn throws', async () => {
      mockClientQuery
        .mockResolvedValueOnce({ rows: [{ locked: true }] })
        .mockResolvedValueOnce({ rows: [] });

      const fn = jest.fn().mockRejectedValue(new Error('boom'));

      await expect(service.withAdvisoryLock(42, fn)).rejects.toThrow('boom');
      expect(mockClientQuery).toHaveBeenCalledTimes(2);
      expect(mockClientRelease).toHaveBeenCalledTimes(1);
    });
  });
});
