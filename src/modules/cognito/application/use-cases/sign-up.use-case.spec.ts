import { SignUpUseCase } from './sign-up.use-case';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { SignUpDto } from '../dtos/sign-up.dto';

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let cognitoService: jest.Mocked<
    Pick<ICognitoService, 'signUp' | 'adminDeleteUser'>
  >;
  let userRepository: jest.Mocked<Pick<IUserRepository, 'create'>>;

  const baseDto: SignUpDto = {
    email: 'user@example.com',
    password: 'password123',
    phone: '12345678',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  const buildPersistedUser = (overrides: Partial<User> = {}): User =>
    new User({
      id: 'user-id',
      cognitoSub: 'cognito-sub',
      email: baseDto.email,
      phone: baseDto.phone,
      firstName: baseDto.firstName,
      lastName: baseDto.lastName,
      role: UserRole.CLIENT,
      countryCode: 'GT',
      companyName: null,
      taxId: null,
      profilePhotoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  beforeEach(() => {
    cognitoService = { signUp: jest.fn(), adminDeleteUser: jest.fn() };
    userRepository = { create: jest.fn() };
    useCase = new SignUpUseCase(
      cognitoService as unknown as ICognitoService,
      userRepository as unknown as IUserRepository,
    );
  });

  it("defaults countryCode to 'GT' when DTO omits country", async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: true,
    });
    userRepository.create.mockResolvedValue(buildPersistedUser());

    const result = await useCase.execute(baseDto);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'GT' }),
    );
    expect(result.user.countryCode).toBe('GT');
  });

  it('honors an explicit country in the DTO', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    userRepository.create.mockResolvedValue(
      buildPersistedUser({ countryCode: 'MX' }),
    );

    const result = await useCase.execute({ ...baseDto, country: 'MX' });

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ countryCode: 'MX' }),
    );
    expect(result.user.countryCode).toBe('MX');
  });

  it('rolls back the Cognito user and rethrows when the DB write fails', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    const dbError = new Error('FK violation on countryCode');
    userRepository.create.mockRejectedValue(dbError);
    cognitoService.adminDeleteUser.mockResolvedValue(undefined);

    await expect(useCase.execute(baseDto)).rejects.toBe(dbError);

    expect(cognitoService.adminDeleteUser).toHaveBeenCalledTimes(1);
    expect(cognitoService.adminDeleteUser).toHaveBeenCalledWith(baseDto.email);
  });

  it('still rethrows the original DB error when the Cognito rollback also fails', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    const dbError = new Error('FK violation on countryCode');
    userRepository.create.mockRejectedValue(dbError);
    cognitoService.adminDeleteUser.mockRejectedValue(
      new Error('Cognito unreachable'),
    );

    await expect(useCase.execute(baseDto)).rejects.toBe(dbError);

    expect(cognitoService.adminDeleteUser).toHaveBeenCalledWith(baseDto.email);
  });
});
