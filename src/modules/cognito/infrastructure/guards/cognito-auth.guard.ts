import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { User } from '../../domain/entities/user.entity';
import { CognitoUser } from '../../domain/types/cognito.types';

export interface RequestWithUser extends Request {
  user: User;
  cognitoUser: CognitoUser;
  accessToken: string;
}

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const cognitoUser = await this.cognitoService.verifyToken(token);
      request.cognitoUser = cognitoUser;
      request.accessToken = token;

      // Try to find local user by Cognito sub
      const localUser = await this.userRepository.findByCognitoSub(
        cognitoUser.sub,
      );

      if (localUser) {
        request.user = localUser;
      }

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
