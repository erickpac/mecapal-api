import {
  ValidationLog,
  ValidationChecklist,
} from '../entities/validation-log.entity';
import { ValidationEntityType } from '../enums/validation-entity-type.enum';
import { RejectionCategory } from '../enums/rejection-category.enum';

export interface TransporterInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface VehicleWithTransporter {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  status: string;
  user: TransporterInfo;
}

export interface TransporterProfileWithUser {
  id: string;
  userId: string;
  licenseNumber: string;
  city: string;
  state: string;
  status: string;
  user: TransporterInfo;
}

export interface PendingValidationItem {
  id: string;
  type: ValidationEntityType;
  transporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: Date;
  summary: Record<string, unknown>;
}

export interface PendingValidationsResult {
  data: PendingValidationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PendingValidationsQuery {
  type?: ValidationEntityType;
  search?: string;
  sort?: 'recent' | 'oldest' | 'priority';
  page: number;
  limit: number;
}

export interface CreateValidationLogData {
  entityType: ValidationEntityType;
  entityId: string;
  action: 'APPROVED' | 'REJECTED';
  rejectionCategory?: RejectionCategory;
  rejectionDetails?: string;
  checklist?: ValidationChecklist;
  reviewedBy: string;
  transporterId: string;
  emailSent?: boolean;
}

export interface IValidationRepository {
  findPendingValidations(
    query: PendingValidationsQuery,
  ): Promise<PendingValidationsResult>;
  findVehicleById(id: string): Promise<VehicleWithTransporter | null>;
  findTransporterProfileById(
    id: string,
  ): Promise<TransporterProfileWithUser | null>;
  updateVehicleStatus(id: string, status: string): Promise<void>;
  updateTransporterProfileStatus(id: string, status: string): Promise<void>;
  createValidationLog(data: CreateValidationLogData): Promise<ValidationLog>;
}
