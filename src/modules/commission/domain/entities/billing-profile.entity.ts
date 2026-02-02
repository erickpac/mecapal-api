import { CommissionType } from '@prisma/client';

export class BillingProfileEntity {
  id: string;
  name: string;
  description: string | null;

  // Commission
  commissionType: CommissionType;
  commissionValue: number;
  commissionMinimum: number | null;
  commissionMaximum: number | null;
  isCommissionExempt: boolean;

  // Tax
  taxPercent: number;
  isTaxExempt: boolean;

  // Status
  isDefault: boolean;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<BillingProfileEntity>) {
    Object.assign(this, partial);
  }

  /**
   * Calculate the commission amount based on the offered price
   */
  calculateCommission(offeredPrice: number): number {
    if (this.isCommissionExempt) {
      return 0;
    }

    if (this.commissionType === CommissionType.FIXED_AMOUNT) {
      return this.commissionValue;
    }

    // PERCENTAGE type
    let commission = (offeredPrice * this.commissionValue) / 100;

    // Apply minimum bound
    if (
      this.commissionMinimum !== null &&
      commission < this.commissionMinimum
    ) {
      commission = this.commissionMinimum;
    }

    // Apply maximum bound
    if (
      this.commissionMaximum !== null &&
      commission > this.commissionMaximum
    ) {
      commission = this.commissionMaximum;
    }

    return commission;
  }

  /**
   * Calculate the tax amount based on the subtotal (price + commission)
   */
  calculateTax(subtotal: number): number {
    if (this.isTaxExempt) {
      return 0;
    }

    return (subtotal * this.taxPercent) / 100;
  }
}
