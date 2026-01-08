import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../../../cognito/infrastructure/guards/cognito-auth.guard';
import { CurrentUser } from '../../../cognito/infrastructure/decorators/current-user.decorator';
import { User } from '../../../cognito/domain/entities/user.entity';
import { GeneratePresignedUrlUseCase } from '../../application/use-cases/generate-presigned-url.use-case';
import { PresignedUrlRequestDto } from '../../application/dtos/presigned-url-request.dto';

@Controller('upload')
@UseGuards(CognitoAuthGuard)
export class UploadController {
  constructor(
    private readonly generatePresignedUrlUseCase: GeneratePresignedUrlUseCase,
  ) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @CurrentUser() user: User,
    @Body() dto: PresignedUrlRequestDto,
  ) {
    return this.generatePresignedUrlUseCase.execute(user.id, dto);
  }
}
