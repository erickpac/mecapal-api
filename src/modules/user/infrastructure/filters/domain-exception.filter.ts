import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { EmailAlreadyTakenException } from '../../domain/exceptions/email-already-taken.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    const code = exception.code;

    if (exception instanceof UserNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof EmailAlreadyTakenException) {
      status = HttpStatus.CONFLICT;
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      code: code,
    });
  }
}
