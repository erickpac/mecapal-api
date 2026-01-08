export class SendValidationApprovalEmailDto {
  transporterEmail: string;
  transporterName: string;
  entityType: 'vehicle' | 'profile';
  entitySummary?: string;
}
