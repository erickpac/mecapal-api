import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ForgotPasswordRateLimitedException } from '../../domain/exceptions/cognito.exceptions';

@Catch(ForgotPasswordRateLimitedException)
export class ForgotPasswordRateLimitFilter implements ExceptionFilter {
  catch(exception: ForgotPasswordRateLimitedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: exception.message,
      error: 'RATE_LIMITED',
    });
  }
}
