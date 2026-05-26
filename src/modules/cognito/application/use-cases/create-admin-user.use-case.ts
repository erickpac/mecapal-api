import { Inject, Injectable } from '@nestjs/common';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { CreateAdminUserDto } from '../dtos/create-admin-user.dto';
import { AdminUserResponseDto } from '../dtos/responses/admin-user-response.dto';

@Injectable()
export class CreateAdminUserUseCase {
  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateAdminUserDto): Promise<AdminUserResponseDto> {
    // 1. Create user in Cognito with temporary password
    const cognitoResult = await this.cognitoService.adminCreateUser(
      dto.email,
      dto.temporaryPassword,
    );

    // 2. Create user profile in local database
    const user = await this.userRepository.create({
      cognitoSub: cognitoResult.userSub,
      email: dto.email,
      phone: dto.phone ?? '',
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      countryCode: 'GT',
      companyName: null,
      taxId: null,
      profilePhotoUrl: null,
    });

    return {
      id: user.id,
      cognitoSub: user.cognitoSub,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }
}
