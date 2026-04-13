import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../cognito/infrastructure/guards/cognito-auth.guard';

export const ALLOW_DURING_PENDING_DELETION = 'allowDuringPendingDeletion';

/**
 * Routes may opt out with `@SetMetadata(ALLOW_DURING_PENDING_DELETION, true)`.
 * Used by the cancel-deletion endpoint and sign-out so users can exit the
 * flow or close their session.
 */
@Injectable()
export class PendingDeletionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<boolean | undefined>(
      ALLOW_DURING_PENDING_DELETION,
      [context.getHandler(), context.getClass()],
    );
    if (allowed) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();

    // Public endpoints have no user attached — let them through.
    if (!req.user) return true;

    // Only block mutating methods. Reads stay open so the user can still
    // see their history, orders, etc. while pending deletion.
    if (req.method === 'GET' || req.method === 'HEAD') return true;

    // Auth-scoped routes (sign-out, change-password, etc.) stay open so
    // the user can exit the pending-deletion state or close their session.
    if (req.path.startsWith('/api/auth/') || req.path.startsWith('/auth/')) {
      return true;
    }

    if (req.user.deletionScheduledFor) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'ACCOUNT_PENDING_DELETION',
        message:
          'Your account is scheduled for deletion. Cancel the deletion before making changes.',
        scheduledFor: req.user.deletionScheduledFor,
      });
    }

    return true;
  }
}
