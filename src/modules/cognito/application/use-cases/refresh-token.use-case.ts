import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { TokenResponseDto } from '../dtos/responses/token-response.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    const tokens = await this.cognitoService.refreshToken(dto.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      expiresIn: tokens.expiresIn,
    };
  }
}
