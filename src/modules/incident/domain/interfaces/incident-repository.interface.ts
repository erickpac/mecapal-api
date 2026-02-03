import { Incident } from '../entities/incident.entity';
import { IncidentStatus } from '../enums/incident-status.enum';
import { IncidentSeverity } from '../enums/incident-severity.enum';
import { IncidentType } from '../enums/incident-type.enum';
import { IncidentResolution } from '../enums/incident-resolution.enum';
import { UserAction } from '../enums/user-action.enum';

export interface CreateIncidentData {
  type: IncidentType;
  severity?: IncidentSeverity;
  description: string;
  evidenceUrls?: string[];
  reportedById: string;
  reportedAgainstId: string;
  orderId: string;
}

export interface UpdateIncidentData {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  internalNotes?: string;
  assignedToId?: string;
}

export interface ResolveIncidentData {
  resolution: IncidentResolution;
  resolutionNotes: string;
  refundAmount?: number;
  userAction?: UserAction;
}

export interface IncidentFilters {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  type?: IncidentType;
  reportedById?: string;
  reportedAgainstId?: string;
  assignedToId?: string;
  orderId?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IncidentStats {
  total: number;
  open: number;
  investigating: number;
  resolved: number;
  closed: number;
}

export interface IIncidentRepository {
  create(data: CreateIncidentData): Promise<Incident>;
  findById(id: string): Promise<Incident | null>;
  findByIncidentNumber(incidentNumber: string): Promise<Incident | null>;
  findByFilters(filters: IncidentFilters): Promise<Incident[]>;
  findByOrderId(orderId: string): Promise<Incident[]>;
  update(id: string, data: UpdateIncidentData): Promise<Incident>;
  resolve(id: string, data: ResolveIncidentData): Promise<Incident>;
  getStats(): Promise<IncidentStats>;
  generateIncidentNumber(): Promise<string>;
}
