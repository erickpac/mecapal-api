import { Test, TestingModule } from '@nestjs/testing';
import { UserAlreadyExistsException } from '../../../domain/exceptions/user-already-exists.exception';
import { RegisterUseCase } from '../register.use-case';
import { AUTH_TOKENS } from '../../../domain/constants/injection-tokens';
import { mockRegisterDto, mockUser } from './__mocks__/user.mock';
import { mockAuthRepository } from './__mocks__/auth-repository.mock';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: AUTH_TOKENS.IAuthRepository,
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
      mockAuthRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await useCase.execute(mockRegisterDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(mockAuthRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockRegisterDto.email,
          name: mockRegisterDto.name,
          phone: mockRegisterDto.phone,
          role: mockRegisterDto.role,
        }),
      );
      // Verify that create was called with a hashed password
      expect(mockAuthRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw UserAlreadyExistsException when email already exists', async () => {
      // Arrange
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(mockRegisterDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(mockAuthRepository.create).not.toHaveBeenCalled();
    });
  });
});
