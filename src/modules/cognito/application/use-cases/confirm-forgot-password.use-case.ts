import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { ConfirmForgotPasswordDto } from '../dtos/confirm-forgot-password.dto';

@Injectable()
export class ConfirmForgotPasswordUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(dto: ConfirmForgotPasswordDto): Promise<{ message: string }> {
    await this.cognitoService.confirmForgotPassword(
      dto.email,
      dto.code,
      dto.newPassword,
    );

    return {
      message: 'Password reset successfully. You can now sign in.',
    };
  }
}
