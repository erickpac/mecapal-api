/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserNotFoundException } from '../../../domain/exceptions/user-not-found.exception';
import { RecoveryPasswordUseCase } from '../recovery-password.use-case';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import { mockUser } from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';
import { mockPasswordHasher } from './__mocks__/password-hasher.mock';
import { mockEmailService } from './__mocks__/email-service.mock';

describe('RecoveryPasswordUseCase', () => {
  let useCase: RecoveryPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryPasswordUseCase,
        {
          provide: AUTH_TOKENS.IAuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: AUTH_TOKENS.IPasswordHasher,
          useValue: mockPasswordHasher,
        },
        {
          provide: AUTH_TOKENS.IEmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    useCase = module.get<RecoveryPasswordUseCase>(RecoveryPasswordUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully recovery password and send email', async () => {
      // Arrange
      const email = 'test@example.com';
      const hashedPassword = 'hashedNewPassword';

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockEmailService.sendPasswordRecovery.mockResolvedValue(undefined);
      mockAuthRepository.update.mockResolvedValue(mockUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(expect.any(String));
      expect(mockEmailService.sendPasswordRecovery).toHaveBeenCalledWith(
        email,
        mockUser.name,
        expect.any(String),
      );
      expect(mockAuthRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: hashedPassword,
      });
    });

    it('should throw UserNotFoundException when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockEmailService.sendPasswordRecovery).not.toHaveBeenCalled();
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should generate a new password with correct length', async () => {
      // Arrange
      const email = 'test@example.com';
      const hashedPassword = 'hashedNewPassword';

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockEmailService.sendPasswordRecovery.mockResolvedValue(undefined);
      mockAuthRepository.update.mockResolvedValue(mockUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(expect.any(String));

      const generatedPassword = mockPasswordHasher.hash.mock.calls[0][0];
      expect(generatedPassword).toHaveLength(8);
    });
  });
});
