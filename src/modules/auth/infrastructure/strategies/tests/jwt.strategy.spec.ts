import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';
import { AuthRepository } from '../../repositories/auth.repository';
import { mockUser, mockPayload } from './mocks/jwt.strategy.mock';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthRepository,
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
    userRepository = module.get<AuthRepository>(AuthRepository);
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
