import { AccessTokenPayload } from '../types/access-token-payload.type';
import { RefreshTokenPayload } from '../types/refresh-token-payload.type';

/**
 * Token service interface
 * Abstracts JWT token generation and verification
 */
export interface ITokenService {
  generateAccessToken(payload: AccessTokenPayload): Promise<string>;
  generateRefreshToken(payload: RefreshTokenPayload): Promise<string>;
  verifyRefreshToken(token: string): RefreshTokenPayload;
}
