import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidPasswordException } from '../../domain/exceptions/invalid-password.exception';

/**
 * Exception filter to map domain exceptions to HTTP responses
 * This maintains the separation between domain and infrastructure layers
 */
@Catch(
  UserAlreadyExistsException,
  InvalidCredentialsException,
  UserNotFoundException,
  InvalidPasswordException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: HttpStatus;
    let message: string;

    if (exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      message = 'Email already exists';
    } else if (exception instanceof InvalidCredentialsException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Invalid credentials';
    } else if (exception instanceof UserNotFoundException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'User not found';
    } else if (exception instanceof InvalidPasswordException) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'Current password is incorrect';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    this.logger.error(
      `Domain exception: ${exception.name} - ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
