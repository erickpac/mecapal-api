import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { GeneratePresignedUrlUseCase } from '../../application/use-cases/generate-presigned-url.use-case';
import { PresignedUrlRequestDto } from '../../application/dtos/presigned-url-request.dto';

@Controller('upload')
@UseGuards(CognitoAuthGuard, ThrottlerGuard)
export class UploadController {
  constructor(
    private readonly generatePresignedUrlUseCase: GeneratePresignedUrlUseCase,
  ) {}

  // 10 presigned URLs per minute per IP. Generous for a real user
  // (replace photo, retry on failure) but cuts off scripted abuse that
  // would otherwise mint presigned policies and pile up orphaned files.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('presigned-url')
  async getPresignedUrl(
    @CurrentUser() user: User,
    @Body() dto: PresignedUrlRequestDto,
  ) {
    return this.generatePresignedUrlUseCase.execute(user.id, dto);
  }
}
