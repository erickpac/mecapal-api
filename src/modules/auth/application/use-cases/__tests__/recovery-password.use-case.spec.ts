import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { RecoveryPasswordUseCase } from '../recovery-password.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { ResendService } from '../../../../resend/resend.service';
import { mockUser } from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';
import { mockResendService } from './__mocks__/resend-service.mock';
import * as bcrypt from 'bcrypt';

describe('RecoveryPasswordUseCase', () => {
  let useCase: RecoveryPasswordUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoveryPasswordUseCase,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: ResendService,
          useValue: mockResendService,
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
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockResendService.sendEmail.mockResolvedValue(undefined);
      mockAuthRepository.update.mockResolvedValue(mockUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      expect(mockResendService.sendEmail).toHaveBeenCalledWith(
        email,
        'Recuperación de Contraseña',
        expect.stringContaining(
          `Hola ${mockUser.name}, <br>tu nueva contraseña es:`,
        ),
      );
      expect(mockAuthRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: hashedPassword,
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(email)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockResendService.sendEmail).not.toHaveBeenCalled();
      expect(mockAuthRepository.update).not.toHaveBeenCalled();
    });

    it('should generate a new password with correct length', async () => {
      // Arrange
      const email = 'test@example.com';
      const hashedPassword = 'hashedNewPassword';

      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockResendService.sendEmail.mockResolvedValue(undefined);
      mockAuthRepository.update.mockResolvedValue(mockUser);

      // Act
      await useCase.execute(email);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const generatedPassword = (bcrypt.hash as jest.Mock).mock.calls[0][0];
      expect(generatedPassword).toHaveLength(8);
    });
  });
});
