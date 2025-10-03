import { ITokenService } from '../../../../domain/services/token.service.interface';

export const mockTokenService: jest.Mocked<ITokenService> = {
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
};
