import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { COGNITO_TOKENS } from '../../domain/constants/injection-tokens';
import { ICognitoService } from '../../domain/interfaces/ICognitoService';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserRole } from '../../domain/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { SignUpDto } from '../dtos/sign-up.dto';
import { SignUpResponseDto } from '../dtos/responses/sign-up-response.dto';
import { USER_TOKENS } from '../../../user/domain/constants/injection-tokens';
import { ITermsAcceptanceRepository } from '../../../user/domain/repositories/terms-acceptance.repository';
import {
  CURRENT_TERMS_VERSION,
  LEGAL_DOCUMENT_TYPE,
} from '../../../user/domain/constants/legal.constants';

@Injectable()
export class SignUpUseCase {
  private readonly logger = new Logger(SignUpUseCase.name);

  constructor(
    @Inject(COGNITO_TOKENS.ICognitoService)
    private readonly cognitoService: ICognitoService,
    @Inject(COGNITO_TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(USER_TOKENS.ITermsAcceptanceRepository)
    private readonly termsAcceptanceRepository: ITermsAcceptanceRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: SignUpDto): Promise<SignUpResponseDto> {
    // 1. Register user in Cognito
    const cognitoResult = await this.cognitoService.signUp(
      dto.email,
      dto.password,
    );

    // 2. Persist the user profile AND the T&C acceptance atomically.
    //    Both writes run on the same interactive transaction, so a failure
    //    in either rolls back the whole thing — a usable account can never
    //    exist without its acceptance row. The backend stamps the current
    //    version (the client never sends it) so the record is authoritative.
    //    If the transaction fails we roll back the Cognito user too, leaving
    //    the email cleanly retryable instead of half-provisioned.
    let user: User;
    try {
      user = await this.prisma.$transaction(async (tx) => {
        const created = await this.userRepository.create(
          {
            cognitoSub: cognitoResult.userSub,
            email: dto.email,
            phone: dto.phone,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: dto.role ?? UserRole.CLIENT,
            companyName: dto.companyName ?? null,
            taxId: dto.taxId ?? null,
            profilePhotoUrl: null,
          },
          tx,
        );

        await this.termsAcceptanceRepository.create(
          {
            userId: created.id,
            documentType: LEGAL_DOCUMENT_TYPE.TERMS,
            version: CURRENT_TERMS_VERSION,
          },
          tx,
        );

        return created;
      });
    } catch (error) {
      try {
        await this.cognitoService.adminDeleteUser(dto.email);
      } catch (rollbackError) {
        const err = rollbackError as { message?: string };
        this.logger.error(
          `Failed to roll back Cognito user ${cognitoResult.userSub} after DB write failure: ${err.message ?? 'unknown error'}`,
        );
      }
      throw error;
    }

    return {
      user: {
        id: user.id,
        cognitoSub: user.cognitoSub,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: user.companyName,
        taxId: user.taxId,
      },
      message: cognitoResult.userConfirmed
        ? 'User registered successfully'
        : 'User registered. Please check your email for verification code.',
    };
  }
}
