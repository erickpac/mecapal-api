import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';

@Injectable()
export class SignOutUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(accessToken: string): Promise<{ message: string }> {
    await this.cognitoService.signOut(accessToken);

    return {
      message: 'Signed out successfully.',
    };
  }
}
