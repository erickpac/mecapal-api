import { ExecutionContext } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

// Mock createParamDecorator to capture and execute the function
let capturedDecoratorFunction: (data: unknown, ctx: ExecutionContext) => User;

const mockCreateParamDecorator = jest.fn(
  (fn: (data: unknown, ctx: ExecutionContext) => User) => {
    capturedDecoratorFunction = fn;
    return fn; // Return the original function to maintain functionality
  },
);

// Mock the createParamDecorator
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual<typeof import('@nestjs/common')>('@nestjs/common'),
  createParamDecorator: mockCreateParamDecorator,
}));

describe('CurrentUser Decorator', () => {
  let mockExecutionContext: ExecutionContext;
  let mockRequest: Request & { user?: User | null };
  let mockUser: User;

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockRequest = {
      user: mockUser,
    } as Request & { user: User };

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  describe('Decorator creation and function capture', () => {
    it('should create a parameter decorator and capture the function', async () => {
      // Import the decorator to trigger createParamDecorator call
      await jest.isolateModulesAsync(async () => {
        await import('../current-user.decorator');
      });

      expect(mockCreateParamDecorator).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(capturedDecoratorFunction).toBeDefined();
    });
  });

  describe('Decorator function execution', () => {
    beforeEach(async () => {
      // Import the decorator to set up capturedDecoratorFunction
      await jest.isolateModulesAsync(async () => {
        await import('../current-user.decorator');
      });
    });

    it('should extract user from request using the actual decorator function', () => {
      // Arrange
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');

      // Act - Execute the actual decorator function
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toEqual(mockUser);
      expect(switchToHttpSpy).toHaveBeenCalledTimes(1);
    });

    it('should call switchToHttp and getRequest methods in the decorator function', () => {
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');
      const httpContext = mockExecutionContext.switchToHttp();
      const getRequestSpy = jest.spyOn(httpContext, 'getRequest');

      // Act - Execute the actual decorator function
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(switchToHttpSpy).toHaveBeenCalled();
      expect(getRequestSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should work with different user data', () => {
      const differentUser: User = {
        id: 'user-456',
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'differentPassword',
        phone: null,
        role: UserRole.TRANSPORTER,
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-02-02'),
      };

      mockRequest.user = differentUser;

      // Act
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toEqual(differentUser);
    });

    it('should handle undefined user in request', () => {
      mockRequest.user = undefined;

      // Act
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toBeUndefined();
    });

    it('should handle null user in request', () => {
      (mockRequest as { user: User | null }).user = null;

      // Act
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toBeNull();
    });

    it('should ignore data parameter and extract user from request', () => {
      const someData = 'ignored-data';

      // Act
      const result = capturedDecoratorFunction(someData, mockExecutionContext);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should work with user having null phone', () => {
      const userWithNullPhone: User = {
        ...mockUser,
        phone: null,
      };
      mockRequest.user = userWithNullPhone;

      // Act
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toEqual(userWithNullPhone);
    });

    it('should work with user having different role', () => {
      const transporterUser: User = {
        ...mockUser,
        role: UserRole.TRANSPORTER,
      };
      mockRequest.user = transporterUser;

      // Act
      const result = capturedDecoratorFunction(undefined, mockExecutionContext);

      // Assert
      expect(result).toEqual(transporterUser);
    });

    it('should throw error when execution context is invalid', () => {
      const invalidExecutionContext = {} as ExecutionContext;

      // Act & Assert
      expect(() =>
        capturedDecoratorFunction(undefined, invalidExecutionContext),
      ).toThrow();
    });

    it('should throw error when switchToHttp returns invalid context', () => {
      const invalidHttpContext = {
        switchToHttp: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      // Act & Assert
      expect(() =>
        capturedDecoratorFunction(undefined, invalidHttpContext),
      ).toThrow();
    });
  });

  describe('Decorator module import', () => {
    it('should export CurrentUser decorator', async () => {
      const decoratorModule = await import('../current-user.decorator');
      expect(decoratorModule.CurrentUser).toBeDefined();
      expect(typeof decoratorModule.CurrentUser).toBe('function');
    });
  });
});
