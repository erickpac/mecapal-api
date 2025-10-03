/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { RefreshTokenUseCase } from '../refresh-token.use-case';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import {
  mockRefreshToken,
  mockRefreshTokenPayload,
  mockUser,
} from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';
import { mockTokenService } from './__mocks__/token-service.mock';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: AUTH_TOKENS.IAuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: AUTH_TOKENS.ITokenService,
          useValue: mockTokenService,
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
      mockTokenService.verifyRefreshToken.mockReturnValue(
        mockRefreshTokenPayload,
      );
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockResolvedValue(
        'new_access_token',
      );
      mockTokenService.generateRefreshToken.mockResolvedValue(
        'new_refresh_token',
      );

      // Act
      const result = await useCase.execute(mockRefreshToken);

      // Assert
      expect(result).toEqual({
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      });
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(
        mockRefreshTokenPayload.sub,
      );
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UserNotFoundException when user is not found', async () => {
      // Arrange
      mockTokenService.verifyRefreshToken.mockReturnValue(
        mockRefreshTokenPayload,
      );
      mockAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockRefreshToken)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(
        mockRefreshTokenPayload.sub,
      );
    });

    it('should throw InvalidCredentialsException when refresh token is invalid', async () => {
      // Arrange
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(useCase.execute(mockRefreshToken)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(mockAuthRepository.findById).not.toHaveBeenCalled();
    });
  });
});
