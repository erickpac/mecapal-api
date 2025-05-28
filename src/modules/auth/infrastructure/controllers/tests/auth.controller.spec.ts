import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import {
  mockRegisterUseCase,
  mockLoginUseCase,
  mockRefreshTokenUseCase,
  mockChangePasswordUseCase,
  mockUser,
  mockTokens,
  registerDto,
  loginDto,
  refreshTokenDto,
  changePasswordDto,
} from './mocks/use-cases.mock';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUseCase,
          useValue: mockRegisterUseCase,
        },
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: RefreshTokenUseCase,
          useValue: mockRefreshTokenUseCase,
        },
        {
          provide: ChangePasswordUseCase,
          useValue: mockChangePasswordUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const executeSpy = jest.spyOn(mockRegisterUseCase, 'execute');
      executeSpy.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(executeSpy).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const executeSpy = jest.spyOn(mockLoginUseCase, 'execute');
      executeSpy.mockResolvedValue(mockTokens);

      const result = await controller.login(loginDto);

      expect(executeSpy).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refreshToken', () => {
    it('should refresh the access token', async () => {
      const executeSpy = jest.spyOn(mockRefreshTokenUseCase, 'execute');
      executeSpy.mockResolvedValue(mockTokens);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(executeSpy).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword',
      };

      const executeSpy = jest.spyOn(mockChangePasswordUseCase, 'execute');
      executeSpy.mockResolvedValue(undefined);

      await controller.changePassword(userWithPassword, changePasswordDto);

      expect(executeSpy).toHaveBeenCalledWith(
        userWithPassword.id,
        changePasswordDto,
      );
    });
  });
});
