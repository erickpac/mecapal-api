import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import { mockUser, mockPayload } from './__mocks__/jwt.strategy.mock';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AUTH_TOKENS.IAuthRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'JWT_SECRET':
                  return 'test-secret';
                case 'JWT_REFRESH_SECRET':
                  return 'test-refresh-secret';
                case 'JWT_EXPIRATION_TIME':
                  return '1h';
                case 'JWT_REFRESH_EXPIRATION_TIME':
                  return '7d';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    userRepository = module.get(AUTH_TOKENS.IAuthRepository);
  });

  describe('constructor', () => {
    it('should throw error when JWT_SECRET is not defined', async () => {
      // Arrange - create a module with ConfigService that returns undefined for JWT_SECRET
      const createModuleWithNoSecret = async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            JwtStrategy,
            {
              provide: AUTH_TOKENS.IAuthRepository,
              useValue: {
                findById: jest.fn(),
              },
            },
            {
              provide: ConfigService,
              useValue: {
                get: jest.fn((key: string) => {
                  if (key === 'JWT_SECRET') {
                    return undefined; // Simulate missing JWT_SECRET
                  }
                  return 'some-value';
                }),
              },
            },
          ],
        }).compile();

        // This should throw an error during construction
        module.get<JwtStrategy>(JwtStrategy);
      };

      // Act & Assert
      await expect(createModuleWithNoSecret()).rejects.toThrow(
        'JWT_SECRET is not defined',
      );
    });

    it('should throw error when JWT_SECRET is empty string', async () => {
      // Arrange - create a module with ConfigService that returns empty string for JWT_SECRET
      const createModuleWithEmptySecret = async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            JwtStrategy,
            {
              provide: AUTH_TOKENS.IAuthRepository,
              useValue: {
                findById: jest.fn(),
              },
            },
            {
              provide: ConfigService,
              useValue: {
                get: jest.fn((key: string) => {
                  if (key === 'JWT_SECRET') {
                    return ''; // Simulate empty JWT_SECRET
                  }
                  return 'some-value';
                }),
              },
            },
          ],
        }).compile();

        // This should throw an error during construction
        module.get<JwtStrategy>(JwtStrategy);
      };

      // Act & Assert
      await expect(createModuleWithEmptySecret()).rejects.toThrow(
        'JWT_SECRET is not defined',
      );
    });

    it('should successfully create strategy when JWT_SECRET is provided', () => {
      // This is already covered by the beforeEach setup
      expect(strategy).toBeDefined();
      expect(strategy).toBeInstanceOf(JwtStrategy);
    });
  });

  describe('validate', () => {
    const findByIdSpy = () => jest.spyOn(userRepository, 'findById');

    it('should return user when found', async () => {
      findByIdSpy().mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockUser);
      expect(findByIdSpy()).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      findByIdSpy().mockResolvedValue(null);

      const validatePromise = strategy.validate(mockPayload);
      await expect(validatePromise).rejects.toThrow(UnauthorizedException);
      expect(findByIdSpy()).toHaveBeenCalledWith(mockPayload.sub);
    });
  });
});
