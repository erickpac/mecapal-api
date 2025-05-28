export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh' | 'access';
  jti: string;
  exp?: number;
  iat?: number;
}
