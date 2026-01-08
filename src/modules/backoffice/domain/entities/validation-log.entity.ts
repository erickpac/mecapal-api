import { ValidationEntityType } from '../enums/validation-entity-type.enum';
import { RejectionCategory } from '../enums/rejection-category.enum';

export interface ValidationChecklist {
  photosAreClear: boolean;
  licensePlateVisible: boolean;
  vinMatchesDocuments: boolean;
  insuranceValidMoreThan30Days: boolean;
  documentsNotAltered: boolean;
  informationIsConsistent: boolean;
}

export class ValidationLog {
  id: string;
  entityType: ValidationEntityType;
  entityId: string;
  action: string;
  rejectionCategory: RejectionCategory | null;
  rejectionDetails: string | null;
  checklist: ValidationChecklist | null;
  reviewedBy: string;
  transporterId: string;
  emailSent: boolean;
  createdAt: Date;

  constructor(partial: Partial<ValidationLog>) {
    Object.assign(this, partial);
  }
}
