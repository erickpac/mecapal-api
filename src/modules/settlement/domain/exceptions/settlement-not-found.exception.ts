import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class SettlementNotFoundException extends DomainException {
  constructor(id?: string) {
    super(
      id ? `Settlement with ID ${id} not found` : 'Settlement not found',
      ErrorCode.SETTLEMENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
    );
  }
}
