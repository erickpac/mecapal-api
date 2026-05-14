import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class SettlementAlreadyExistsException extends DomainException {
  constructor(orderId: string) {
    super(
      `Settlement already exists for order ${orderId}`,
      ErrorCode.SETTLEMENT_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
    );
  }
}
