import { SetMetadata } from '@nestjs/common';
import { Roles, ROLES_KEY } from '../roles.decorator';
import { UserRole } from '@prisma/client';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set metadata with roles', () => {
    // Arrange
    const roles = [UserRole.USER, UserRole.TRANSPORTER];

    // Act
    Roles(...roles);

    // Assert
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });

  it('should handle single role', () => {
    // Arrange
    const role = UserRole.USER;

    // Act
    Roles(role);

    // Assert
    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, [role]);
  });
});
