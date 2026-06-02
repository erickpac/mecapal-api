import { MobileSignInUseCase } from './mobile-sign-in.use-case';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { SignInDto } from '../dtos/sign-in.dto';

describe('MobileSignInUseCase', () => {
  let useCase: MobileSignInUseCase;
  let cognitoService: jest.Mocked<Pick<ICognitoService, 'signIn'>>;
  let userRepository: jest.Mocked<Pick<IUserRepository, 'findByEmail'>>;

  const dto: SignInDto = {
    email: 'user@example.com',
    password: 'password123',
  };

  const buildPersistedUser = (overrides: Partial<User> = {}): User =>
    new User({
      id: 'user-id',
      cognitoSub: 'cognito-sub',
      email: dto.email,
      phone: '12345678',
      firstName: 'Jane',
      lastName: 'Doe',
      role: UserRole.CLIENT,
      companyName: null,
      taxId: null,
      profilePhotoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

  beforeEach(() => {
    cognitoService = { signIn: jest.fn() };
    userRepository = { findByEmail: jest.fn() };
    useCase = new MobileSignInUseCase(
      cognitoService as unknown as ICognitoService,
      userRepository as unknown as IUserRepository,
    );
  });

  it('returns the DB user profile in the response payload', async () => {
    cognitoService.signIn.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      idToken: 'id-token',
      expiresIn: 3600,
    });
    userRepository.findByEmail.mockResolvedValue(
      buildPersistedUser({ role: UserRole.TRANSPORTER }),
    );

    const result = await useCase.execute(dto);

    expect(result.user.email).toBe(dto.email);
    expect(result.user.role).toBe(UserRole.TRANSPORTER);
  });
});
