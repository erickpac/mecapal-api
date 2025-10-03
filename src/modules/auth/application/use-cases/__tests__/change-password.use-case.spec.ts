/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { InvalidPasswordException } from '../../../domain/exceptions/invalid-password.exception';
import { ChangePasswordUseCase } from '../change-password.use-case';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import { mockChangePasswordDto } from './__mocks__/user.mock';
import { mockUser } from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';
import { mockPasswordHasher } from './__mocks__/password-hasher.mock';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: AUTH_TOKENS.IAuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: AUTH_TOKENS.IPasswordHasher,
          useValue: mockPasswordHasher,
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
      mockPasswordHasher.compare.mockResolvedValue(true);
      mockPasswordHasher.hash.mockResolvedValue('newHashedPassword');
      mockAuthRepository.update.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
      });

      // Act
      await useCase.execute(mockUser.id, mockChangePasswordDto);

      // Assert
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockChangePasswordDto.current_password,
        mockUser.password,
      );
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        mockChangePasswordDto.new_password,
      );
      expect(mockAuthRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: 'newHashedPassword',
      });
    });

    it('should throw UserNotFoundException when user is not found', async () => {
      // Arrange
      mockAuthRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(mockUser.id, mockChangePasswordDto),
      ).rejects.toThrow(UserNotFoundException);
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should throw InvalidPasswordException when current password is incorrect', async () => {
      // Arrange
      mockAuthRepository.findById.mockResolvedValue(mockUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(
        useCase.execute(mockUser.id, mockChangePasswordDto),
      ).rejects.toThrow(InvalidPasswordException);
      expect(mockAuthRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(
        mockChangePasswordDto.current_password,
        mockUser.password,
      );
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });
  });
});
