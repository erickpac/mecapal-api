import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { CompleteNewPasswordDto } from '../dtos/complete-new-password.dto';
import { AuthResponseDto } from '../dtos/responses/auth-response.dto';
import { UserNotFoundException } from '../../domain/exceptions/cognito.exceptions';

@Injectable()
export class CompleteNewPasswordUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CompleteNewPasswordDto): Promise<AuthResponseDto> {
    // 1. Complete the new password challenge
    const tokens = await this.cognitoService.respondToNewPasswordChallenge(
      dto.email,
      dto.newPassword,
      dto.session,
    );

    // 2. Get user profile from local database
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UserNotFoundException();
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
