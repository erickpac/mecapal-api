export class SendValidationRejectionEmailDto {
  transporterEmail: string;
  transporterName: string;
  entityType: 'vehicle' | 'profile';
  rejectionCategory: string;
  rejectionDetails?: string;
  entitySummary?: string;
}
