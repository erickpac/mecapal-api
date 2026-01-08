import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CognitoException,
  InvalidCredentialsException,
  UserAlreadyExistsException,
  UserNotConfirmedException,
  InvalidCodeException,
  ExpiredCodeException,
  InvalidPasswordException,
  UserNotFoundException,
  InvalidTokenException,
} from '../../domain/exceptions/cognito.exceptions';

@Catch(CognitoException)
export class CognitoExceptionFilter implements ExceptionFilter {
  catch(exception: CognitoException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = this.getHttpStatus(exception);

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
    });
  }

  private getHttpStatus(exception: CognitoException): number {
    if (
      exception instanceof InvalidCredentialsException ||
      exception instanceof InvalidTokenException
    ) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof UserNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof UserAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }

    if (
      exception instanceof UserNotConfirmedException ||
      exception instanceof InvalidCodeException ||
      exception instanceof ExpiredCodeException ||
      exception instanceof InvalidPasswordException
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
