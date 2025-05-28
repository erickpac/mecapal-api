import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../login.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { mockLoginDto } from './mocks/user.mock';
import { mockUser } from './mocks/user.mock';
import { mockAuthRepository } from './mocks/auth-repository.mock';
import { mockJwtService } from './mocks/jwt-service.mock';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockImplementation(
        (payload: { type?: string }) => {
          if (payload.type === 'refresh') {
            return Promise.resolve('refresh_token');
          }
          return Promise.resolve('access_token');
        },
      );

      // Act
      const result = await useCase.execute(mockLoginDto);

      // Assert
      expect(result).toEqual({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockLoginDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password,
      );
    });
  });
});
