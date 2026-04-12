import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CognitoRateLimitedException } from '../../domain/exceptions/cognito.exceptions';

@Catch(CognitoRateLimitedException)
export class CognitoRateLimitFilter implements ExceptionFilter {
  catch(exception: CognitoRateLimitedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: exception.message,
      error: 'RATE_LIMITED',
    });
  }
}
