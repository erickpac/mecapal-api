import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserRole } from '../../domain/enums/user-role.enum';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignUpResponseDto } from '../dtos/responses/sign-up-response.dto';

@Injectable()
export class SignUpUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: SignUpDto): Promise<SignUpResponseDto> {
    // 1. Register user in Cognito
    const cognitoResult = await this.cognitoService.signUp(
      dto.email,
      dto.password,
    );

    // 2. Create user profile in local database
    const user = await this.userRepository.create({
      cognitoSub: cognitoResult.userSub,
      email: dto.email,
      name: dto.name,
      phone: dto.phone ?? null,
      role: dto.role ?? UserRole.USER,
    });

    return {
      user: {
        id: user.id,
        cognitoSub: user.cognitoSub,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      message: cognitoResult.userConfirmed
        ? 'User registered successfully'
        : 'User registered. Please check your email for verification code.',
    };
  }
}
