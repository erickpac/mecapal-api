import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from '../auth.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  mockUser,
  mockCreateUserData,
  mockUpdateUserData,
} from './mocks/user.mock';

describe('AuthRepository', () => {
  let repository: AuthRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository, PrismaService],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createSpy = jest.spyOn(prismaService.user, 'create');
      createSpy.mockResolvedValue(mockUser);

      const result = await repository.create(mockCreateUserData);

      expect(result).toEqual(mockUser);
      expect(createSpy).toHaveBeenCalledWith({
        data: mockCreateUserData,
      });
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      const result = await repository.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should return null when user not found', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(mockUser);

      const result = await repository.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when user not found', async () => {
      const findUniqueSpy = jest.spyOn(prismaService.user, 'findUnique');
      findUniqueSpy.mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
      expect(findUniqueSpy).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
      });
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const updatedUser = { ...mockUser, ...mockUpdateUserData };
      const updateSpy = jest.spyOn(prismaService.user, 'update');
      updateSpy.mockResolvedValue(updatedUser);

      const result = await repository.update(mockUser.id, mockUpdateUserData);

      expect(result).toEqual(updatedUser);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: mockUpdateUserData,
      });
    });
  });
});
