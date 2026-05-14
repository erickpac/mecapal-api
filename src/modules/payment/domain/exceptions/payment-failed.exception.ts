import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ErrorCode } from '../../../../common/exceptions/error-code';

export class PaymentFailedException extends DomainException {
  /**
   * @param message  Human/log-facing failure description.
   * @param failureCode  Optional provider-specific failure code (e.g. the
   *   Stripe decline code `card_declined`). Surfaced under `details` so
   *   clients can react to the granular reason without it replacing the
   *   stable `PAYMENT_FAILED` contract code.
   */
  constructor(
    message: string,
    public readonly failureCode?: string,
  ) {
    super(
      `Payment failed: ${message}`,
      ErrorCode.PAYMENT_FAILED,
      HttpStatus.BAD_REQUEST,
    );
  }

  get details(): Record<string, unknown> | undefined {
    return this.failureCode ? { failureCode: this.failureCode } : undefined;
  }
}
