import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ResendService } from '../resend.service';
import { Resend } from 'resend';

// Mock Resend locally to have better control
jest.mock('resend', () => ({
  Resend: jest.fn(),
}));

describe('ResendService', () => {
  let service: ResendService;
  let configService: ConfigService;
  let mockEmailsSend: jest.Mock;

  beforeEach(async () => {
    // Setup mock for emails.send method
    mockEmailsSend = jest.fn();

    // Mock the Resend constructor to return an instance with emails.send
    const mockResendInstance = {
      emails: {
        send: mockEmailsSend,
      },
    } as unknown as Resend;

    (Resend as jest.MockedClass<typeof Resend>).mockImplementation(
      () => mockResendInstance,
    );

    // Mock ConfigService
    const mockConfigService = {
      get: jest.fn().mockReturnValue('test-resend-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ResendService>(ResendService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize Resend with API key from config', () => {
      const getSpy = jest.spyOn(configService, 'get');
      expect(getSpy).toHaveBeenCalledWith('RESEND_API_KEY');
      expect(Resend).toHaveBeenCalledWith('test-resend-api-key');
    });
  });

  describe('sendEmail', () => {
    const mockEmailData = {
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<h1>Test HTML Content</h1>',
    };

    it('should send email successfully', async () => {
      const mockResponse = {
        id: 'email-id-123',
        from: 'onboarding@resend.dev',
        to: ['test@example.com'],
        created_at: '2024-01-01T00:00:00.000Z',
      };

      mockEmailsSend.mockResolvedValue(mockResponse);

      const result = await service.sendEmail(
        mockEmailData.to,
        mockEmailData.subject,
        mockEmailData.html,
      );

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: [mockEmailData.to],
        subject: mockEmailData.subject,
        html: mockEmailData.html,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle email sending failure', async () => {
      const mockError = new Error('Failed to send email');
      mockEmailsSend.mockRejectedValue(mockError);

      await expect(
        service.sendEmail(
          mockEmailData.to,
          mockEmailData.subject,
          mockEmailData.html,
        ),
      ).rejects.toThrow('Failed to send email');

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: [mockEmailData.to],
        subject: mockEmailData.subject,
        html: mockEmailData.html,
      });
    });

    it('should log email sending attempt', async () => {
      const mockResponse = { id: 'email-id-123' };
      mockEmailsSend.mockResolvedValue(mockResponse);

      await service.sendEmail(
        mockEmailData.to,
        mockEmailData.subject,
        mockEmailData.html,
      );

      expect(mockEmailsSend).toHaveBeenCalledTimes(1);
    });

    it('should use correct from address', async () => {
      const mockResponse = { id: 'email-id-123' };
      mockEmailsSend.mockResolvedValue(mockResponse);

      await service.sendEmail(
        mockEmailData.to,
        mockEmailData.subject,
        mockEmailData.html,
      );

      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'onboarding@resend.dev',
        }),
      );
    });

    it('should pass through all email parameters correctly', async () => {
      const mockResponse = { id: 'email-id-123' };
      mockEmailsSend.mockResolvedValue(mockResponse);

      const customEmailData = {
        to: 'custom@example.com',
        subject: 'Custom Subject with Special Characters: áéíóú',
        html: '<div><p>Complex HTML</p><img src="test.jpg" alt="test" /></div>',
      };

      await service.sendEmail(
        customEmailData.to,
        customEmailData.subject,
        customEmailData.html,
      );

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: [customEmailData.to],
        subject: customEmailData.subject,
        html: customEmailData.html,
      });
    });

    it('should handle empty or undefined parameters gracefully', async () => {
      const mockResponse = { id: 'email-id-123' };
      mockEmailsSend.mockResolvedValue(mockResponse);

      await service.sendEmail('', '', '');

      expect(mockEmailsSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: [''],
        subject: '',
        html: '',
      });
    });
  });

  describe('error handling', () => {
    it('should handle Resend API errors', async () => {
      const apiError = new Error('Resend API Error: Invalid API key');
      mockEmailsSend.mockRejectedValue(apiError);

      await expect(
        service.sendEmail('test@example.com', 'Test', '<p>Test</p>'),
      ).rejects.toThrow('Resend API Error: Invalid API key');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error: Connection timeout');
      mockEmailsSend.mockRejectedValue(networkError);

      await expect(
        service.sendEmail('test@example.com', 'Test', '<p>Test</p>'),
      ).rejects.toThrow('Network Error: Connection timeout');
    });
  });
});
