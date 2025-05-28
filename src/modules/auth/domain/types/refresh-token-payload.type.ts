export interface RefreshTokenPayload {
  sub: string;
  type: string;
  jti: string;
  exp?: number;
  iat?: number;
}
