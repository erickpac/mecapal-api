import { IEmailService } from '../../../../domain/services/email.service.interface';

export const mockEmailService: jest.Mocked<IEmailService> = {
  sendPasswordRecovery: jest.fn(),
  sendWelcomeEmail: jest.fn(),
};
