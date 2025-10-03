/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidCredentialsException } from '../../../domain/exceptions/invalid-credentials.exception';
import { LoginUseCase } from '../login.use-case';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import { mockLoginDto } from './__mocks__/user.mock';
import { mockUser } from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';
import { mockPasswordHasher } from './__mocks__/password-hasher.mock';
import { mockTokenService } from './__mocks__/token-service.mock';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: AUTH_TOKENS.IAuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: AUTH_TOKENS.IPasswordHasher,
          useValue: mockPasswordHasher,
        },
        {
          provide: AUTH_TOKENS.ITokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully login and return tokens', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockResolvedValue('access_token');
      mockTokenService.generateRefreshToken.mockResolvedValue('refresh_token');

      // Act
      const result = await useCase.execute(mockLoginDto);

      // Assert
      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: mockUser,
      });
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(mockTokenService.generateAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenService.generateRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidCredentialsException when user is not found', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsException when password is invalid', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
    });
  });
});
