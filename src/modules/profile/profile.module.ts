import { Module } from '@nestjs/common';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ProfileRepository } from './infrastructure/repositories/profile.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [UpdateProfileUseCase, GetProfileUseCase, ProfileRepository],
  exports: [ProfileRepository],
})
export class ProfileModule {}
