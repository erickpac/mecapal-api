import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '@prisma/client';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new JwtAuthGuard();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
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

  describe('canActivate', () => {
    it('should call super.canActivate with the execution context', () => {
      // Arrange
      const superCanActivateSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should return the result from super.canActivate', () => {
      // Arrange
      const mockResult = Promise.resolve(true);
      jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'canActivate',
        )
        .mockReturnValue(mockResult);

      // Act
      const result = guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(mockResult);
    });
  });

  describe('handleRequest', () => {
    let mockUser: User;

    beforeEach(() => {
      mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        phone: '+1234567890',
        role: UserRole.USER,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };
    });

    it('should return user when user is provided and no error', () => {
      // Act
      const result = guard.handleRequest(null, mockUser, null);

      // Assert
      expect(result).toBe(mockUser);
    });

    it('should return user when user is provided with different role', () => {
      // Arrange
      const transporterUser: User = {
        ...mockUser,
        role: UserRole.TRANSPORTER,
      };

      // Act
      const result = guard.handleRequest(null, transporterUser, null);

      // Assert
      expect(result).toBe(transporterUser);
    });

    it('should throw UnauthorizedException when user is null', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Invalid token or token expired',
      );
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, undefined, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(null, undefined, null)).toThrow(
        'Invalid token or token expired',
      );
    });

    it('should throw error when error is provided and user is valid', () => {
      // Arrange
      const mockError = new Error('JWT verification failed');

      // Act & Assert
      expect(() => guard.handleRequest(mockError, mockUser, null)).toThrow(
        'JWT verification failed',
      );
    });

    it('should throw error when error is provided and user is null', () => {
      // Arrange
      const mockError = new Error('JWT verification failed');

      // Act & Assert
      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        'JWT verification failed',
      );
    });

    it('should throw UnauthorizedException when error is null and user is null', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should ignore info parameter and work correctly', () => {
      // Arrange
      const mockInfo = { message: 'Some JWT info' };

      // Act
      const result = guard.handleRequest(null, mockUser, mockInfo);

      // Assert
      expect(result).toBe(mockUser);
    });

    it('should work with generic user type', () => {
      // Arrange
      interface CustomUser {
        id: string;
        username: string;
      }
      const customUser: CustomUser = {
        id: 'custom-123',
        username: 'customUser',
      };

      // Act
      const result = guard.handleRequest<CustomUser>(null, customUser, null);

      // Assert
      expect(result).toBe(customUser);
      expect(result.id).toBe('custom-123');
      expect(result.username).toBe('customUser');
    });

    it('should handle falsy user values', () => {
      // Test with false
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      expect(() => guard.handleRequest(null, false as any, null)).toThrow(
        UnauthorizedException,
      );

      // Test with empty string
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      expect(() => guard.handleRequest(null, '' as any, null)).toThrow(
        UnauthorizedException,
      );

      // Test with 0
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      expect(() => guard.handleRequest(null, 0 as any, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should preserve error type when error is provided', () => {
      // Arrange
      const customError = new UnauthorizedException('Custom auth error');

      // Act & Assert
      expect(() => guard.handleRequest(customError, mockUser, null)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.handleRequest(customError, mockUser, null)).toThrow(
        'Custom auth error',
      );
    });
  });

  describe('integration tests', () => {
    it('should be an instance of AuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
      expect(guard.constructor.name).toBe('JwtAuthGuard');
    });

    it('should have required methods', () => {
      expect(typeof guard.canActivate).toBe('function');
      expect(typeof guard.handleRequest).toBe('function');
    });
  });
});
