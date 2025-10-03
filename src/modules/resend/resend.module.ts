import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ResendService } from './resend.service';

@Module({
  imports: [ConfigModule],
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
