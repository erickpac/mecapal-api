import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAccountDeletionBlockerService } from '../../domain/interfaces/account-deletion-blocker-service.interface';
import { DeletionBlocker } from '../../domain/exceptions/account-deletion.exceptions';

const ACTIVE_ORDER_STATUSES = [
  'CONFIRMED',
  'IN_PROGRESS',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
] as const;

const ACTIVE_DELIVERY_REQUEST_STATUSES = [
  'PUBLISHED',
  'OFFERS_RECEIVED',
  'ACCEPTED',
  'IN_PROGRESS',
  'PICKED_UP',
] as const;

const OPEN_INCIDENT_STATUSES = ['OPEN', 'INVESTIGATING'] as const;

@Injectable()
export class AccountDeletionBlockerService implements IAccountDeletionBlockerService {
  constructor(private readonly prisma: PrismaService) {}

  async findBlockers(userId: string): Promise<DeletionBlocker[]> {
    const [activeOrders, pendingSettlements, openIncidents, activeRequests] =
      await Promise.all([
        this.prisma.order.count({
          where: {
            OR: [{ clientId: userId }, { transporterId: userId }],
            status: { in: [...ACTIVE_ORDER_STATUSES] },
          },
        }),
        this.prisma.settlement.count({
          where: { transporterId: userId, status: 'PENDING' },
        }),
        this.prisma.incident.count({
          where: {
            OR: [{ reportedById: userId }, { reportedAgainstId: userId }],
            status: { in: [...OPEN_INCIDENT_STATUSES] },
          },
        }),
        this.prisma.deliveryRequest.count({
          where: {
            clientId: userId,
            status: { in: [...ACTIVE_DELIVERY_REQUEST_STATUSES] },
          },
        }),
      ]);

    const blockers: DeletionBlocker[] = [];
    if (activeOrders > 0) blockers.push('ACTIVE_ORDERS');
    if (pendingSettlements > 0) blockers.push('PENDING_SETTLEMENTS');
    if (openIncidents > 0) blockers.push('OPEN_INCIDENTS');
    if (activeRequests > 0) blockers.push('ACTIVE_DELIVERY_REQUESTS');
    return blockers;
  }
}
