import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.cognitoService.forgotPassword(dto.email);

    // Timing-attack mitigation: randomize latency on the success/absorbed path
    // so clients cannot infer email existence from response time. Rate-limit
    // path throws before reaching here and is unaffected.
    const jitterMs = 50 + Math.floor(Math.random() * 101);
    await new Promise((resolve) => setTimeout(resolve, jitterMs));

    return {
      message: 'If the email exists, a verification code has been sent.',
    };
  }
}
