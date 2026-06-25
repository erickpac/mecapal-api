import { SignUpUseCase } from './sign-up.use-case';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { ITermsAcceptanceRepository } from '../../../user/domain/repositories/terms-acceptance.repository';
import { CURRENT_TERMS_VERSION } from '../../../user/domain/constants/legal.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { SignUpDto } from '../dtos/sign-up.dto';

describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let cognitoService: jest.Mocked<
    Pick<ICognitoService, 'signUp' | 'adminDeleteUser'>
  >;
  let userRepository: jest.Mocked<Pick<IUserRepository, 'create'>>;
  let termsRepository: jest.Mocked<ITermsAcceptanceRepository>;
  let prisma: jest.Mocked<Pick<PrismaService, '$transaction'>>;

  // Stand-in transaction client passed to repo.create; opaque in unit tests.
  const fakeTx = {} as never;

  const baseDto: SignUpDto = {
    email: 'user@example.com',
    password: 'password123',
    phone: '12345678',
    firstName: 'Jane',
    lastName: 'Doe',
    acceptedTerms: true,
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
    termsRepository = { create: jest.fn() };
    // Run the interactive transaction callback inline so both writes execute
    // and any rejection inside it propagates exactly like a real rollback.
    prisma = {
      $transaction: jest.fn((cb: (tx: never) => unknown) => cb(fakeTx)),
    } as unknown as jest.Mocked<Pick<PrismaService, '$transaction'>>;
    useCase = new SignUpUseCase(
      cognitoService as unknown as ICognitoService,
      userRepository as unknown as IUserRepository,
      termsRepository,
      prisma as unknown as PrismaService,
    );
  });

  it('persists the user and returns the created profile', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: true,
    });
    userRepository.create.mockResolvedValue(buildPersistedUser());

    const result = await useCase.execute(baseDto);

    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: baseDto.email, role: UserRole.CLIENT }),
      fakeTx,
    );
    expect(result.user.email).toBe(baseDto.email);
  });

  it('records a TERMS acceptance with the backend-stamped version', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    userRepository.create.mockResolvedValue(buildPersistedUser());

    await useCase.execute(baseDto);

    expect(termsRepository.create).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        documentType: 'TERMS',
        version: CURRENT_TERMS_VERSION,
      },
      fakeTx,
    );
  });

  it('rolls back Cognito when the T&C acceptance write fails (no partial success)', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    userRepository.create.mockResolvedValue(buildPersistedUser());
    const termsError = new Error('terms write failed');
    termsRepository.create.mockRejectedValue(termsError);
    cognitoService.adminDeleteUser.mockResolvedValue(undefined);

    await expect(useCase.execute(baseDto)).rejects.toBe(termsError);

    expect(termsRepository.create).toHaveBeenCalledTimes(1);
    expect(cognitoService.adminDeleteUser).toHaveBeenCalledTimes(1);
    expect(cognitoService.adminDeleteUser).toHaveBeenCalledWith(baseDto.email);
  });

  it('rolls back the Cognito user and rethrows when the DB write fails', async () => {
    cognitoService.signUp.mockResolvedValue({
      userSub: 'cognito-sub',
      userConfirmed: false,
    });
    const dbError = new Error('DB write failed');
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
    const dbError = new Error('DB write failed');
    userRepository.create.mockRejectedValue(dbError);
    cognitoService.adminDeleteUser.mockRejectedValue(
      new Error('Cognito unreachable'),
    );

    await expect(useCase.execute(baseDto)).rejects.toBe(dbError);

    expect(cognitoService.adminDeleteUser).toHaveBeenCalledWith(baseDto.email);
  });
});
