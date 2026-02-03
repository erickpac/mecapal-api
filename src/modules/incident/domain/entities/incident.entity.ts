import { IncidentStatus } from '../enums/incident-status.enum';
import { IncidentSeverity } from '../enums/incident-severity.enum';
import { IncidentType } from '../enums/incident-type.enum';
import { IncidentResolution } from '../enums/incident-resolution.enum';
import { UserAction } from '../enums/user-action.enum';

export class Incident {
  id: string;
  incidentNumber: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  evidenceUrls: string[];
  internalNotes?: string;
  resolution?: IncidentResolution;
  resolutionNotes?: string;
  refundAmount?: number;
  userAction: UserAction;
  resolvedAt?: Date;
  reportedById: string;
  reportedAgainstId: string;
  orderId: string;
  assignedToId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Incident>) {
    Object.assign(this, partial);
  }
}
