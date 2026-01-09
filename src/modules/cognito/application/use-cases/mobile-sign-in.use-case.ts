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
} from '../../domain/exceptions/cognito.exceptions';

const ALLOWED_ROLES = [UserRole.CLIENT, UserRole.TRANSPORTER];

@Injectable()
export class MobileSignInUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
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
        companyName: user.companyName,
        taxId: user.taxId,
      },
    };
  }
}
