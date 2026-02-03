import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { COMMISSION_INJECTION_TOKENS } from './domain/constants/injection-tokens';

// Repository
import { BillingProfileRepository } from './infrastructure/repositories';

// Controller
import { BillingProfileController } from './infrastructure/controllers';

// Use Cases
import {
  CreateBillingProfileUseCase,
  GetBillingProfilesUseCase,
  GetBillingProfileUseCase,
  UpdateBillingProfileUseCase,
  DeleteBillingProfileUseCase,
  GetClientBillingProfileUseCase,
  AssignBillingProfileUseCase,
  RemoveBillingProfileUseCase,
} from './application/use-cases';

const useCases = [
  CreateBillingProfileUseCase,
  GetBillingProfilesUseCase,
  GetBillingProfileUseCase,
  UpdateBillingProfileUseCase,
  DeleteBillingProfileUseCase,
  GetClientBillingProfileUseCase,
  AssignBillingProfileUseCase,
  RemoveBillingProfileUseCase,
];

@Module({
  imports: [PrismaModule],
  controllers: [BillingProfileController],
  providers: [
    // Repository binding
    {
      provide: COMMISSION_INJECTION_TOKENS.BILLING_PROFILE_REPOSITORY,
      useClass: BillingProfileRepository,
    },
    // Use cases
    ...useCases,
  ],
  exports: [
    // Export use case that delivery module needs
    GetClientBillingProfileUseCase,
  ],
})
export class CommissionModule {}
