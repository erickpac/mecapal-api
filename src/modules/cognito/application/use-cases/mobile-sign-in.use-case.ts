import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { IAccountStatusPort } from '../../domain/interfaces/IAccountStatusPort';
import { SignInDto } from '../dtos/sign-in.dto';
import { AuthResponseDto } from '../dtos/responses/auth-response.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import {
  UserNotFoundException,
  UnauthorizedRoleException,
} from '../../domain/exceptions/cognito.exceptions';

const ALLOWED_ROLES = [UserRole.CLIENT, UserRole.TRANSPORTER];

@Injectable()
export class MobileSignInUseCase {
  private readonly logger = new Logger(MobileSignInUseCase.name);

  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Optional()
    @Inject(COGNITO_TOKENS.IAccountStatusPort)
    private readonly accountStatus?: IAccountStatusPort,
  ) {}

  async execute(dto: SignInDto): Promise<AuthResponseDto> {
    // 1. Authenticate with Cognito
    const tokens = await this.cognitoService.signIn(dto.email, dto.password);

    // 2. Get user profile from local database
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UserNotFoundException();
    }

    // 3. Validate user has mobile app role
    if (!ALLOWED_ROLES.includes(user.role)) {
      throw new UnauthorizedRoleException();
    }

    // 4. Auto-cancel pending deletion, if any. Signing in is interpreted
    // as the user reversing their decision. Wrapped in catch so a failure
    // here does not block login.
    let cancelSucceeded = false;
    if (this.accountStatus) {
      try {
        await this.accountStatus.cancelPendingDeletionIfAny(user.id);
        cancelSucceeded = true;
      } catch (err) {
        this.logger.warn(
          `Failed to auto-cancel pending deletion for ${user.id}: ${
            err instanceof Error ? err.message : 'unknown'
          }`,
        );
      }
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user.id,
        cognitoSub: user.cognitoSub,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        countryCode: user.countryCode,
        companyName: user.companyName,
        taxId: user.taxId,
        profilePhotoUrl: user.profilePhotoUrl,
        // After a successful auto-cancel the state is guaranteed to be
        // cleared, even though `user` in memory still holds the stale
        // value. If auto-cancel didn't run (feature disabled, web/admin
        // flows), fall back to whatever the DB says.
        deletionScheduledFor: cancelSucceeded
          ? null
          : (user.deletionScheduledFor ?? null),
      },
    };
  }
}
