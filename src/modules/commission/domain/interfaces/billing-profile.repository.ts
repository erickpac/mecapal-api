import { CommissionType } from '@prisma/client';
import { BillingProfileEntity } from '../entities';

export interface CreateBillingProfileData {
  name: string;
  description?: string | null;
  commissionType: CommissionType;
  commissionValue: number;
  commissionMinimum?: number | null;
  commissionMaximum?: number | null;
  isCommissionExempt?: boolean;
  taxPercent: number;
  isTaxExempt?: boolean;
  isDefault?: boolean;
}

export interface UpdateBillingProfileData {
  name?: string;
  description?: string | null;
  commissionType?: CommissionType;
  commissionValue?: number;
  commissionMinimum?: number | null;
  commissionMaximum?: number | null;
  isCommissionExempt?: boolean;
  taxPercent?: number;
  isTaxExempt?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface IBillingProfileRepository {
  create(data: CreateBillingProfileData): Promise<BillingProfileEntity>;
  findById(id: string): Promise<BillingProfileEntity | null>;
  findByName(name: string): Promise<BillingProfileEntity | null>;
  findAll(isActive?: boolean): Promise<BillingProfileEntity[]>;
  findDefault(): Promise<BillingProfileEntity | null>;
  update(
    id: string,
    data: UpdateBillingProfileData,
  ): Promise<BillingProfileEntity>;
  delete(id: string): Promise<void>;
  assignToClient(clientId: string, profileId: string): Promise<void>;
  removeFromClient(clientId: string): Promise<void>;
  findByClientId(clientId: string): Promise<BillingProfileEntity | null>;
}
