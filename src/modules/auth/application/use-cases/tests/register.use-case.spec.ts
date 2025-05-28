import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from '../register.use-case';
import { AuthRepository } from '../../../infrastructure/repositories/auth.repository';
import { mockRegisterDto, mockUser } from './mocks/user.mock';
import { mockAuthRepository } from './mocks/auth-repository.mock';
import * as bcrypt from 'bcrypt';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockAuthRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(mockRegisterDto);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockAuthRepository.create).toHaveBeenCalledWith({
        ...mockRegisterDto,
        password: 'hashedPassword',
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(mockAuthRepository.create).not.toHaveBeenCalled();
    });
  });
});
