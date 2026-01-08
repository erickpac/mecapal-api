import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(
    accessToken: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.cognitoService.changePassword(
      accessToken,
      dto.oldPassword,
      dto.newPassword,
    );

    return {
      message: 'Password changed successfully.',
    };
  }
}
