import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  IIncidentRepository,
  CreateIncidentData,
  UpdateIncidentData,
  ResolveIncidentData,
  IncidentFilters,
  IncidentStats,
} from '../../domain/interfaces';
import { Incident } from '../../domain/entities';
import { IncidentStatus } from '../../domain/enums/incident-status.enum';
import { IncidentSeverity } from '../../domain/enums/incident-severity.enum';
import { IncidentType } from '../../domain/enums/incident-type.enum';
import { IncidentResolution } from '../../domain/enums/incident-resolution.enum';
import { UserAction } from '../../domain/enums/user-action.enum';
import {
  Incident as PrismaIncident,
  IncidentStatus as PrismaIncidentStatus,
  IncidentSeverity as PrismaIncidentSeverity,
  IncidentType as PrismaIncidentType,
  IncidentResolution as PrismaIncidentResolution,
  UserAction as PrismaUserAction,
  Prisma,
} from '@prisma/client';

@Injectable()
export class IncidentRepository implements IIncidentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIncidentData): Promise<Incident> {
    const incidentNumber = await this.generateIncidentNumber();

    const incident = await this.prisma.incident.create({
      data: {
        incidentNumber,
        type: data.type as PrismaIncidentType,
        severity:
          (data.severity as PrismaIncidentSeverity) ||
          PrismaIncidentSeverity.MEDIUM,
        description: data.description,
        evidenceUrls: data.evidenceUrls || [],
        reportedById: data.reportedById,
        reportedAgainstId: data.reportedAgainstId,
        orderId: data.orderId,
      },
    });

    return this.mapToEntity(incident);
  }

  async findById(id: string): Promise<Incident | null> {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) return null;
    return this.mapToEntity(incident);
  }

  async findByIncidentNumber(incidentNumber: string): Promise<Incident | null> {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentNumber },
    });

    if (!incident) return null;
    return this.mapToEntity(incident);
  }

  async findByFilters(filters: IncidentFilters): Promise<Incident[]> {
    const where: Prisma.IncidentWhereInput = {};

    if (filters.status) {
      where.status = filters.status as PrismaIncidentStatus;
    }

    if (filters.severity) {
      where.severity = filters.severity as PrismaIncidentSeverity;
    }

    if (filters.type) {
      where.type = filters.type as PrismaIncidentType;
    }

    if (filters.reportedById) {
      where.reportedById = filters.reportedById;
    }

    if (filters.reportedAgainstId) {
      where.reportedAgainstId = filters.reportedAgainstId;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.fromDate || filters.toDate) {
      where.createdAt = {};
      if (filters.fromDate) {
        where.createdAt.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.createdAt.lte = filters.toDate;
      }
    }

    const incidents = await this.prisma.incident.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit,
      skip: filters.offset,
    });

    return incidents.map((i) => this.mapToEntity(i));
  }

  async findByOrderId(orderId: string): Promise<Incident[]> {
    const incidents = await this.prisma.incident.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return incidents.map((i) => this.mapToEntity(i));
  }

  async update(id: string, data: UpdateIncidentData): Promise<Incident> {
    const updateData: Prisma.IncidentUpdateInput = {};

    if (data.status) {
      updateData.status = data.status as PrismaIncidentStatus;
    }

    if (data.severity) {
      updateData.severity = data.severity as PrismaIncidentSeverity;
    }

    if (data.internalNotes !== undefined) {
      updateData.internalNotes = data.internalNotes;
    }

    if (data.assignedToId !== undefined) {
      updateData.assignedTo = data.assignedToId
        ? { connect: { id: data.assignedToId } }
        : { disconnect: true };
    }

    const incident = await this.prisma.incident.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(incident);
  }

  async resolve(id: string, data: ResolveIncidentData): Promise<Incident> {
    const incident = await this.prisma.incident.update({
      where: { id },
      data: {
        status: PrismaIncidentStatus.RESOLVED,
        resolution: data.resolution as PrismaIncidentResolution,
        resolutionNotes: data.resolutionNotes,
        refundAmount: data.refundAmount,
        userAction:
          (data.userAction as PrismaUserAction) || PrismaUserAction.NONE,
        resolvedAt: new Date(),
      },
    });

    return this.mapToEntity(incident);
  }

  async getStats(): Promise<IncidentStats> {
    const [total, open, investigating, resolved, closed] = await Promise.all([
      this.prisma.incident.count(),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.OPEN },
      }),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.INVESTIGATING },
      }),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.RESOLVED },
      }),
      this.prisma.incident.count({
        where: { status: PrismaIncidentStatus.CLOSED },
      }),
    ]);

    return { total, open, investigating, resolved, closed };
  }

  async generateIncidentNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Find the highest incident number for today
    const latestIncident = await this.prisma.incident.findFirst({
      where: {
        incidentNumber: {
          startsWith: `INC-${dateStr}`,
        },
      },
      orderBy: { incidentNumber: 'desc' },
    });

    let sequence = 1;
    if (latestIncident) {
      const lastSequence = parseInt(
        latestIncident.incidentNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `INC-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  private mapToEntity(incident: PrismaIncident): Incident {
    return new Incident({
      id: incident.id,
      incidentNumber: incident.incidentNumber,
      type: incident.type as IncidentType,
      severity: incident.severity as IncidentSeverity,
      status: incident.status as IncidentStatus,
      description: incident.description,
      evidenceUrls: incident.evidenceUrls,
      internalNotes: incident.internalNotes ?? undefined,
      resolution: incident.resolution as IncidentResolution | undefined,
      resolutionNotes: incident.resolutionNotes ?? undefined,
      refundAmount: incident.refundAmount ?? undefined,
      userAction: incident.userAction as UserAction,
      resolvedAt: incident.resolvedAt ?? undefined,
      reportedById: incident.reportedById,
      reportedAgainstId: incident.reportedAgainstId,
      orderId: incident.orderId,
      assignedToId: incident.assignedToId ?? undefined,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
    });
  }
}
