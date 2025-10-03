import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { VehicleNotFoundException } from '../../domain/exceptions/vehicle-not-found.exception';
import { VehiclePhotoNotFoundException } from '../../domain/exceptions/vehicle-photo-not-found.exception';
import { ProfileNotFoundException } from '../../domain/exceptions/profile-not-found.exception';
import { ImageUploadFailedException } from '../../domain/exceptions/image-upload-failed.exception';
import { EmailAlreadyTakenException } from '../../domain/exceptions/email-already-taken.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;
    const code = exception.code;

    if (
      exception instanceof VehicleNotFoundException ||
      exception instanceof VehiclePhotoNotFoundException ||
      exception instanceof ProfileNotFoundException
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ImageUploadFailedException) {
      status = HttpStatus.BAD_REQUEST;
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
