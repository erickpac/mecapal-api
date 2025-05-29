import { UserRole } from '@prisma/client';

export interface RefreshTokenPayload {
  sub: string; // User ID
  email: string; // User email
  role: UserRole; // User role (enum)
  type: 'refresh'; // Token type identifier
  jti?: string; // JWT ID (optional)
  iat?: number; // Issued at (optional, added by JWT)
  exp?: number; // Expires at (optional, added by JWT)
}

export interface AccessTokenPayload {
  sub: string; // User ID
  email: string; // User email
  role: UserRole; // User role (enum)
  type: 'access'; // Token type identifier
  iat?: number; // Issued at (optional, added by JWT)
  exp?: number; // Expires at (optional, added by JWT)
}
