import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RefreshTokenUseCase } from '../refresh-token.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import {
  mockRefreshToken,
  mockRefreshTokenPayload,
  mockUser,
} from './mocks/user.mock';
import { mockAuthRepository } from './mocks/auth-repository.mock';
import { mockJwtService } from './mocks/jwt-service.mock';
import { JwtService } from '@nestjs/jwt';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully refresh tokens', async () => {
      // Arrange
      mockJwtService.verify.mockReturnValue(mockRefreshTokenPayload);
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockImplementation(
        (payload: { type?: string }) => {
          if (payload.type === 'refresh') {
            return Promise.resolve('new_refresh_token');
          }
          return Promise.resolve('new_access_token');
        },
      );

      // Act
      const result = await useCase.execute(mockRefreshToken);

      // Assert
      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: expect.any(String) as string,
      });
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(
        mockRefreshTokenPayload.sub,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockJwtService.verify.mockReturnValue(mockRefreshTokenPayload);
      mockAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: expect.any(String) as string,
      });
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(
        mockRefreshTokenPayload.sub,
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(useCase.execute(mockRefreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: expect.any(String) as string,
      });
      expect(mockAuthRepository.findById).not.toHaveBeenCalled();
    });
  });
});
