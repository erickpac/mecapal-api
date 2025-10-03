import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { Request } from 'express';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { User } from '../../../domain/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Request & { user: User };

  const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    phone: '+1234567890',
    role: UserRole.USER,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);

    mockRequest = {
      user: mockUser,
    } as Request & { user: User };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn(),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when no roles are required (undefined)', () => {
      // Arrange
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when user has the required role', () => {
      // Arrange
      const requiredRoles = [UserRole.USER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when user has one of the required roles', () => {
      // Arrange
      const requiredRoles = [UserRole.TRANSPORTER, UserRole.USER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      // Arrange
      const requiredRoles = [UserRole.TRANSPORTER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when user does not have any of the required roles', () => {
      // Arrange - user is USER but only TRANSPORTER is required
      const requiredRoles = [UserRole.TRANSPORTER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should work with TRANSPORTER role having TRANSPORTER permission', () => {
      // Arrange
      const transporterUser: User = {
        ...mockUser,
        role: UserRole.TRANSPORTER,
      };
      mockRequest.user = transporterUser;
      const requiredRoles = [UserRole.TRANSPORTER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should work with USER role having USER permission', () => {
      // Arrange
      const userWithUserRole: User = {
        ...mockUser,
        role: UserRole.USER,
      };
      mockRequest.user = userWithUserRole;
      const requiredRoles = [UserRole.USER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle empty roles array', () => {
      // Arrange
      const requiredRoles: UserRole[] = [];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(false);
    });

    it('should call reflector with correct parameters', () => {
      // Arrange
      const requiredRoles = [UserRole.USER];
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(requiredRoles);

      // Act
      guard.canActivate(mockExecutionContext);

      // Assert
      expect(getAllAndOverrideSpy).toHaveBeenCalledTimes(1);
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should access user from request correctly', () => {
      // Arrange
      const requiredRoles = [UserRole.USER];
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');
      const getRequestSpy = jest.fn().mockReturnValue(mockRequest);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      switchToHttpSpy.mockReturnValue({
        getRequest: getRequestSpy,
        getResponse: jest.fn(),
      } as any);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(switchToHttpSpy).toHaveBeenCalledTimes(1);
      expect(getRequestSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle case when user role matches exactly one of multiple required roles', () => {
      // Arrange
      const userWithSpecificRole: User = {
        ...mockUser,
        role: UserRole.TRANSPORTER,
      };
      mockRequest.user = userWithSpecificRole;
      const requiredRoles = [UserRole.USER, UserRole.TRANSPORTER];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should have reflector injected', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect((guard as any).reflector).toBe(reflector);
    });
  });

  describe('integration with decorators', () => {
    it('should use ROLES_KEY constant from decorator', () => {
      // Arrange
      const requiredRoles = [UserRole.TRANSPORTER];
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(requiredRoles);

      // Act
      guard.canActivate(mockExecutionContext);

      // Assert
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(
        ROLES_KEY,
        expect.any(Array),
      );
    });
  });
});
