import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CognitoModule } from '../cognito/cognito.module';
import { DeliveryModule } from '../delivery/delivery.module';

// Controller
import { MatchingController } from './infrastructure/controllers/matching.controller';

// Services
import { MatchingService } from './infrastructure/services/matching.service';

// Use Cases
import {
  FindEligibleTransportersUseCase,
  FindTransportersForRequestUseCase,
} from './application/use-cases';

// Tokens
import { MATCHING_TOKENS } from './domain/constants';

@Module({
  imports: [PrismaModule, CognitoModule, forwardRef(() => DeliveryModule)],
  controllers: [MatchingController],
  providers: [
    // Services
    {
      provide: MATCHING_TOKENS.IMatchingService,
      useClass: MatchingService,
    },

    // Use Cases
    FindEligibleTransportersUseCase,
    FindTransportersForRequestUseCase,
  ],
  exports: [
    MATCHING_TOKENS.IMatchingService,
    FindEligibleTransportersUseCase,
    FindTransportersForRequestUseCase,
  ],
})
export class MatchingModule {}
