import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { UserResponseDto } from '../dtos/responses/user-response.dto';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(accessToken: string): Promise<UserResponseDto> {
    const user = await this.cognitoService.getUser(accessToken);

    return {
      sub: user.sub,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  }
}
