import { IPasswordHasher } from '../../../../domain/services/password-hasher.interface';

export const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
  hash: jest.fn(),
  compare: jest.fn(),
};
