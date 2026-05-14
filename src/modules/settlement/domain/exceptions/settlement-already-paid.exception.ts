import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class SettlementAlreadyPaidException extends DomainException {
  constructor() {
    super(
      'Settlement has already been paid',
      ErrorCode.SETTLEMENT_ALREADY_PAID,
      HttpStatus.CONFLICT,
    );
  }
}
