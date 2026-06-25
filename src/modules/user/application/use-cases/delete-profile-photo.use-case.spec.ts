import { DeleteProfilePhotoUseCase } from './delete-profile-photo.use-case';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { IS3Service } from '../../../upload/domain/interfaces/s3.service.interface';
import { User } from '../../../cognito/domain/entities/user.entity';
import { UserRole } from '../../../cognito/domain/enums/user-role.enum';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';

describe('DeleteProfilePhotoUseCase', () => {
  let useCase: DeleteProfilePhotoUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let s3Service: jest.Mocked<IS3Service>;

  const userId = 'user-id';
  const photoUrl = 'https://cdn.mekapal.com/profile-photos/user-id/123-abc.jpg';

  const buildUser = (profilePhotoUrl: string | null): User =>
    ({
      id: userId,
      cognitoSub: 'sub',
      email: 'a@b.com',
      phone: '+50212345678',
      firstName: 'A',
      lastName: 'B',
      role: UserRole.CLIENT,
      companyName: null,
      taxId: null,
      profilePhotoUrl,
    }) as User;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByIdWithProfile: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
    };
    s3Service = {
      generatePresignedPost: jest.fn(),
      deleteObjects: jest.fn(),
      extractKeyFromUrl: jest.fn(),
    };
    useCase = new DeleteProfilePhotoUseCase(userRepository, s3Service);
  });

  it('throws when the user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('deletes the S3 object and nulls profilePhotoUrl', async () => {
    userRepository.findById.mockResolvedValue(buildUser(photoUrl));
    s3Service.extractKeyFromUrl.mockReturnValue(
      'profile-photos/user-id/123-abc.jpg',
    );
    userRepository.update.mockResolvedValue(buildUser(null));
    userRepository.findByIdWithProfile.mockResolvedValue(buildUser(null));

    const result = await useCase.execute(userId);

    expect(s3Service.deleteObjects).toHaveBeenCalledWith([
      'profile-photos/user-id/123-abc.jpg',
    ]);
    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      profilePhotoUrl: null,
    });
    expect(result.profilePhotoUrl).toBeNull();
  });

  it('is a no-op on S3 when there is no photo, but still returns the user', async () => {
    userRepository.findById.mockResolvedValue(buildUser(null));
    userRepository.update.mockResolvedValue(buildUser(null));
    userRepository.findByIdWithProfile.mockResolvedValue(buildUser(null));

    const result = await useCase.execute(userId);

    expect(s3Service.deleteObjects).not.toHaveBeenCalled();
    expect(result.profilePhotoUrl).toBeNull();
  });

  it('does not call deleteObjects when the key cannot be extracted, but still nulls the field', async () => {
    userRepository.findById.mockResolvedValue(buildUser(photoUrl));
    s3Service.extractKeyFromUrl.mockReturnValue(null);
    userRepository.update.mockResolvedValue(buildUser(null));
    userRepository.findByIdWithProfile.mockResolvedValue(buildUser(null));

    const result = await useCase.execute(userId);

    expect(s3Service.deleteObjects).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      profilePhotoUrl: null,
    });
    expect(result.profilePhotoUrl).toBeNull();
  });

  it('swallows S3 errors and still nulls the field', async () => {
    userRepository.findById.mockResolvedValue(buildUser(photoUrl));
    s3Service.extractKeyFromUrl.mockReturnValue('profile-photos/x.jpg');
    s3Service.deleteObjects.mockRejectedValue(new Error('s3 down'));
    userRepository.update.mockResolvedValue(buildUser(null));
    userRepository.findByIdWithProfile.mockResolvedValue(buildUser(null));

    const result = await useCase.execute(userId);

    expect(userRepository.update).toHaveBeenCalledWith(userId, {
      profilePhotoUrl: null,
    });
    expect(result.profilePhotoUrl).toBeNull();
  });
});
