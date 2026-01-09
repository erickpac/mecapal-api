import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { SignInDto } from '../dtos/sign-in.dto';
import { AuthResponseDto } from '../dtos/responses/auth-response.dto';
import { UserRole } from '../../domain/enums/user-role.enum';
import {
  UserNotFoundException,
  UnauthorizedRoleException,
  NewPasswordRequiredException,
} from '../../domain/exceptions/cognito.exceptions';

const ALLOWED_ROLES = [UserRole.ADMIN, UserRole.BACKOFFICE];

@Injectable()
export class AdminSignInUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: SignInDto): Promise<AuthResponseDto> {
    // 1. Get user profile from local database first to validate role
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UserNotFoundException();
    }

    // 2. Validate user has admin role
    if (!ALLOWED_ROLES.includes(user.role)) {
      throw new UnauthorizedRoleException();
    }

    // 3. Authenticate with Cognito (using admin auth flow)
    const result = await this.cognitoService.adminSignIn(
      dto.email,
      dto.password,
    );

    // 4. Handle NEW_PASSWORD_REQUIRED challenge
    if (result.challengeName === 'NEW_PASSWORD_REQUIRED' && result.session) {
      throw new NewPasswordRequiredException(result.session);
    }

    if (!result.tokens) {
      throw new UserNotFoundException();
    }

    return {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      idToken: result.tokens.idToken,
      expiresIn: result.tokens.expiresIn,
      user: {
        id: user.id,
        cognitoSub: user.cognitoSub,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: user.companyName,
        taxId: user.taxId,
      },
    };
  }
}
