import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ChangePasswordUseCase } from '../change-password.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { mockChangePasswordDto } from './mocks/user.mock';
import { mockUser } from './mocks/user.mock';
import { mockAuthRepository } from './mocks/auth-repository.mock';
import * as bcrypt from 'bcrypt';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully change password', async () => {
      // Arrange
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockAuthRepository.update.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      // Act
      await useCase.execute(mockUser.id, mockChangePasswordDto);

      // Assert
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockChangePasswordDto.current_password,
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockChangePasswordDto.new_password,
        10,
      );
      expect(mockAuthRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'newHashedPassword',
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      mockAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(mockUser.id, mockChangePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      // Arrange
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        useCase.execute(mockUser.id, mockChangePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockChangePasswordDto.current_password,
        mockUser.password,
      );
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });
  });
});
