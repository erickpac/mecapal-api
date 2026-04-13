import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ALLOW_DURING_PENDING_DELETION,
  PendingDeletionGuard,
} from './pending-deletion.guard';

function makeContext(
  method: string,
  path: string,
  user: { deletionScheduledFor?: Date | null } | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method, path, user }),
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}

describe('PendingDeletionGuard', () => {
  let guard: PendingDeletionGuard;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) };
    guard = new PendingDeletionGuard(reflector as unknown as Reflector);
  });

  it('allows public endpoints (no user)', () => {
    expect(
      guard.canActivate(makeContext('POST', '/api/orders', undefined)),
    ).toBe(true);
  });

  it('allows GET requests even when pending deletion', () => {
    const user = { deletionScheduledFor: new Date() };
    expect(guard.canActivate(makeContext('GET', '/api/orders', user))).toBe(
      true,
    );
  });

  it('allows auth-scoped routes', () => {
    const user = { deletionScheduledFor: new Date() };
    expect(
      guard.canActivate(makeContext('POST', '/api/auth/sign-out', user)),
    ).toBe(true);
  });

  it('allows routes marked with ALLOW_DURING_PENDING_DELETION metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const user = { deletionScheduledFor: new Date() };
    expect(guard.canActivate(makeContext('POST', '/api/anything', user))).toBe(
      true,
    );
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      ALLOW_DURING_PENDING_DELETION,
      expect.any(Array),
    );
  });

  it('blocks mutating calls when deletionScheduledFor is set', () => {
    const user = { deletionScheduledFor: new Date() };
    expect(() =>
      guard.canActivate(makeContext('POST', '/api/orders', user)),
    ).toThrow(ForbiddenException);
  });

  it('allows mutating calls when no deletion scheduled', () => {
    const user = { deletionScheduledFor: null };
    expect(guard.canActivate(makeContext('POST', '/api/orders', user))).toBe(
      true,
    );
  });
});
