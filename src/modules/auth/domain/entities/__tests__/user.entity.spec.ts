import { User } from '../user.entity';
import { UserRole } from '../../enums/user-role.enum';

describe('User Entity', () => {
  const mockUserData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    phone: '+1234567890',
    role: UserRole.USER,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  describe('constructor', () => {
    it('should create a user with all properties', () => {
      // Act
      const user = new User(mockUserData);

      // Assert
      expect(user.id).toBe(mockUserData.id);
      expect(user.name).toBe(mockUserData.name);
      expect(user.email).toBe(mockUserData.email);
      expect(user.password).toBe(mockUserData.password);
      expect(user.phone).toBe(mockUserData.phone);
      expect(user.role).toBe(mockUserData.role);
      expect(user.createdAt).toBe(mockUserData.createdAt);
      expect(user.updatedAt).toBe(mockUserData.updatedAt);
    });

    it('should create a user with partial data', () => {
      // Arrange
      const partialData = {
        id: 'user-456',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      // Act
      const user = new User(partialData);

      // Assert
      expect(user.id).toBe(partialData.id);
      expect(user.name).toBe(partialData.name);
      expect(user.email).toBe(partialData.email);
      expect(user.password).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.role).toBeUndefined();
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });

    it('should create a user with null phone', () => {
      // Arrange
      const userDataWithNullPhone = {
        ...mockUserData,
        phone: null,
      };

      // Act
      const user = new User(userDataWithNullPhone);

      // Assert
      expect(user.phone).toBeNull();
    });

    it('should create a user with different roles', () => {
      // Test TRANSPORTER role
      const transporterUser = new User({
        ...mockUserData,
        role: UserRole.TRANSPORTER,
      });
      expect(transporterUser.role).toBe(UserRole.TRANSPORTER);

      // Test USER role
      const regularUser = new User({ ...mockUserData, role: UserRole.USER });
      expect(regularUser.role).toBe(UserRole.USER);
    });

    it('should create a user with empty object', () => {
      // Act
      const user = new User({});

      // Assert
      expect(user.id).toBeUndefined();
      expect(user.name).toBeUndefined();
      expect(user.email).toBeUndefined();
      expect(user.password).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.role).toBeUndefined();
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });

    it('should create a user with undefined values', () => {
      // Arrange
      const userDataWithUndefined = {
        id: undefined,
        name: undefined,
        email: undefined,
        password: undefined,
        phone: undefined,
        role: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      // Act
      const user = new User(userDataWithUndefined);

      // Assert
      expect(user.id).toBeUndefined();
      expect(user.name).toBeUndefined();
      expect(user.email).toBeUndefined();
      expect(user.password).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.role).toBeUndefined();
      expect(user.createdAt).toBeUndefined();
      expect(user.updatedAt).toBeUndefined();
    });
  });

  describe('properties', () => {
    it('should have correct property types', () => {
      // Act
      const user = new User(mockUserData);

      // Assert
      expect(typeof user.id).toBe('string');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.password).toBe('string');
      expect(typeof user.phone).toBe('string');
      expect(typeof user.role).toBe('string');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow property reassignment', () => {
      // Arrange
      const user = new User(mockUserData);
      const newName = 'Updated Name';
      const newEmail = 'updated@example.com';

      // Act
      user.name = newName;
      user.email = newEmail;

      // Assert
      expect(user.name).toBe(newName);
      expect(user.email).toBe(newEmail);
    });
  });
});
