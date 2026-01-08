import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { ConfirmSignUpDto } from '../dtos/confirm-sign-up.dto';

@Injectable()
export class ConfirmSignUpUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(dto: ConfirmSignUpDto): Promise<{ message: string }> {
    await this.cognitoService.confirmSignUp(dto.email, dto.code);

    return {
      message: 'Email verified successfully. You can now sign in.',
    };
  }
}
