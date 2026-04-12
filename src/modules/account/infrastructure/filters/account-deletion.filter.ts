import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AccountAlreadyScheduledForDeletionException,
  AccountDeletionBlockedException,
  AccountNotScheduledForDeletionException,
} from '../../domain/exceptions/account-deletion.exceptions';

type AccountDeletionException =
  | AccountDeletionBlockedException
  | AccountAlreadyScheduledForDeletionException
  | AccountNotScheduledForDeletionException;

@Catch(
  AccountDeletionBlockedException,
  AccountAlreadyScheduledForDeletionException,
  AccountNotScheduledForDeletionException,
)
export class AccountDeletionExceptionFilter implements ExceptionFilter {
  catch(exception: AccountDeletionException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AccountDeletionBlockedException) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'DELETION_BLOCKED',
        message: exception.message,
        blockers: exception.blockers,
      });
      return;
    }

    if (exception instanceof AccountAlreadyScheduledForDeletionException) {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'DELETION_ALREADY_SCHEDULED',
        message: exception.message,
        scheduledFor: exception.scheduledFor,
      });
      return;
    }

    response.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      error: 'DELETION_NOT_SCHEDULED',
      message: exception.message,
    });
  }
}
