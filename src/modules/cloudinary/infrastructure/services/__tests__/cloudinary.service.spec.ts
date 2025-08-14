/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary.service';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

// Mock sharp
const mockSharpInstance = {
  metadata: jest.fn(),
  resize: jest.fn().mockReturnThis(),
  jpeg: jest.fn().mockReturnThis(),
  toBuffer: jest.fn(),
};

jest.mock('sharp', () => jest.fn(() => mockSharpInstance));

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let mockCloudinary: any;

  beforeEach(async () => {
    // Mock setTimeout to make retry tests faster
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      // Execute immediately without delay
      setImmediate(fn as () => void);
      return {} as NodeJS.Timeout;
    });

    // Get the mocked cloudinary instance
    mockCloudinary = jest.requireMock('cloudinary').v2;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                CLOUDINARY_CLOUD_NAME: 'test-cloud',
                CLOUDINARY_API_KEY: 'test-key',
                CLOUDINARY_API_SECRET: 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);

    // Mock logger to avoid actual logging in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore setTimeout
    jest.restoreAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should configure cloudinary on instantiation', () => {
      expect(mockCloudinary.config).toHaveBeenCalledWith({
        cloud_name: 'test-cloud',
        api_key: 'test-key',
        api_secret: 'test-secret',
        secure: true,
      });
    });

    it('should throw error if cloudinary configuration is incomplete', async () => {
      const incompleteConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            CLOUDINARY_CLOUD_NAME: 'test-cloud',
            CLOUDINARY_API_KEY: '', // Missing API key
            CLOUDINARY_API_SECRET: 'test-secret',
          };
          return config[key];
        }),
      };

      await expect(async () => {
        await Test.createTestingModule({
          providers: [
            CloudinaryService,
            {
              provide: ConfigService,
              useValue: incompleteConfigService,
            },
          ],
        }).compile();
      }).rejects.toThrow('Cloudinary configuration is not complete');
    });

    it('should call onModuleInit correctly', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      service.onModuleInit();
      expect(logSpy).toHaveBeenCalledWith('Cloudinary service initialized');
    });
  });

  describe('uploadImage', () => {
    const testBuffer = Buffer.from('test image data');

    it('should upload image successfully', async () => {
      const mockResult = {
        public_id: 'test-id',
        secure_url: 'https://cloudinary.com/test.jpg',
      };

      const mockEnd = jest.fn();
      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options: any, callback: any) => {
          callback(null, mockResult);
          return { end: mockEnd };
        },
      );

      const result = await service.uploadImage(testBuffer);

      expect(result).toEqual(mockResult);
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'auto' },
        expect.any(Function),
      );
    });

    it('should upload image with folder', async () => {
      const mockResult = { public_id: 'test-id' };
      const mockEnd = jest.fn();

      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options: any, callback: any) => {
          callback(null, mockResult);
          return { end: mockEnd };
        },
      );

      await service.uploadImage(testBuffer, 'test-folder');

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        { resource_type: 'auto', folder: 'test-folder' },
        expect.any(Function),
      );
    });

    it('should upload image with transformations', async () => {
      const mockResult = { public_id: 'test-id' };
      const transformations = {
        width: 800,
        height: 600,
        crop: 'fill' as const,
        quality: 80,
        format: 'jpg' as const,
      };
      const mockEnd = jest.fn();

      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options: any, callback: any) => {
          callback(null, mockResult);
          return { end: mockEnd };
        },
      );

      await service.uploadImage(testBuffer, 'test-folder', transformations);

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          resource_type: 'auto',
          folder: 'test-folder',
          transformation: [
            {
              width: 800,
              height: 600,
              crop: 'fill',
              quality: 80,
              format: 'jpg',
            },
          ],
        },
        expect.any(Function),
      );
    });

    it('should retry on upload failure and eventually succeed', async () => {
      const mockResult = { public_id: 'test-id' };
      const mockEnd = jest.fn();

      let callCount = 0;
      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options: any, callback: any) => {
          callCount++;
          if (callCount === 1) {
            callback(new Error('Network error'), null);
          } else {
            callback(null, mockResult);
          }
          return { end: mockEnd };
        },
      );

      // Start the async operation
      const result = await service.uploadImage(testBuffer);

      expect(result).toEqual(mockResult);
      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
    });

    it('should fail after maximum retries', async () => {
      const mockEnd = jest.fn();
      mockCloudinary.uploader.upload_stream.mockImplementation(
        (options: any, callback: any) => {
          callback(new Error('Persistent error'), null);
          return { end: mockEnd };
        },
      );

      // Start the async operation
      await expect(service.uploadImage(testBuffer)).rejects.toThrow(
        'Failed to upload image after 3 attempts: Persistent error',
      );

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledTimes(3);
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const mockResult = { result: 'ok' };
      mockCloudinary.uploader.destroy.mockResolvedValue(mockResult);

      const result = await service.deleteImage('test-public-id');

      expect(result).toEqual(mockResult);
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
        'test-public-id',
      );
    });

    it('should retry on delete failure and eventually succeed', async () => {
      const mockResult = { result: 'ok' };

      let callCount = 0;
      mockCloudinary.uploader.destroy.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Network error');
        } else {
          return Promise.resolve(mockResult);
        }
      });

      // Start the async operation
      const result = await service.deleteImage('test-public-id');

      expect(result).toEqual(mockResult);
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
    });

    it('should fail after maximum retries', async () => {
      mockCloudinary.uploader.destroy.mockRejectedValue(
        new Error('Persistent error'),
      );

      // Start the async operation
      await expect(service.deleteImage('test-public-id')).rejects.toThrow(
        'Failed to delete image after 3 attempts: Persistent error',
      );

      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledTimes(3);
    });
  });

  describe('extractPublicId', () => {
    it('should extract public ID from standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBe('sample');
    });

    it('should extract public ID from URL with version', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBe('sample');
    });

    it('should extract public ID from URL with folder', () => {
      const url =
        'https://res.cloudinary.com/demo/image/upload/folder/sample.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBe('folder/sample');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/invalid-url.jpg';
      const result = service.extractPublicId(url);
      expect(result).toBeNull();
    });

    it('should handle errors gracefully', () => {
      const result = service.extractPublicId('');
      expect(result).toBeNull();
    });

    it('should handle regex parsing errors', () => {
      // Spy on String.prototype.match to force an error
      const originalMatch = String.prototype.match.bind(String.prototype);
      String.prototype.match = jest.fn(() => {
        throw new Error('Regex error');
      });

      const result = service.extractPublicId('test-url');
      expect(result).toBeNull();

      // Restore original method
      String.prototype.match = originalMatch;
    });
  });

  describe('validateImage', () => {
    beforeEach(() => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'jpeg',
      });
    });

    it('should validate a valid image', async () => {
      const testBuffer = Buffer.alloc(1024 * 1024); // 1MB
      const result = await service.validateImage(testBuffer);
      expect(result).toBe(true);
    });

    it('should throw error for oversized image', async () => {
      const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB

      await expect(service.validateImage(largeBuffer)).rejects.toThrow(
        'Image size exceeds maximum allowed size of 10MB',
      );
    });

    it('should throw error for image with unknown dimensions', async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: undefined,
        height: undefined,
        format: 'jpeg',
      });

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Could not determine image dimensions',
      );
    });

    it('should throw error for image with too small dimensions', async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 50,
        height: 50,
        format: 'jpeg',
      });

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Image dimensions too small. Minimum dimension is 100px',
      );
    });

    it('should throw error for image with too large dimensions', async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 5000,
        height: 5000,
        format: 'jpeg',
      });

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Image dimensions too large. Maximum dimension is 4096px',
      );
    });

    it('should throw error for invalid format', async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: 'bmp', // Invalid format
      });

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Invalid image format. Allowed formats: jpeg, jpg, png, heic, heif, webp',
      );
    });

    it('should handle sharp errors gracefully', async () => {
      mockSharpInstance.metadata.mockRejectedValue(
        new Error('Sharp processing error'),
      );

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Image validation failed: Sharp processing error',
      );
    });

    it('should handle non-Error exceptions gracefully', async () => {
      mockSharpInstance.metadata.mockRejectedValue('String error');

      const testBuffer = Buffer.alloc(1024);
      await expect(service.validateImage(testBuffer)).rejects.toThrow(
        'Failed to validate image',
      );
    });
  });

  describe('optimizeImage', () => {
    beforeEach(() => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
      });
      mockSharpInstance.toBuffer.mockResolvedValue(Buffer.alloc(1024));
    });

    it('should return original buffer for small images', async () => {
      // Mock the buffer length check by spying on buffer.length
      const smallBuffer = Buffer.alloc(1024); // 1KB
      Object.defineProperty(smallBuffer, 'length', { value: 3 * 1024 * 1024 }); // Mock as 3MB (< 5MB threshold)

      const result = await service.optimizeImage(smallBuffer);
      expect(result).toBe(smallBuffer);
    });

    it('should optimize large images', async () => {
      const largeBuffer = Buffer.alloc(1024); // Small actual buffer for test speed
      Object.defineProperty(largeBuffer, 'length', { value: 8 * 1024 * 1024 }); // Mock as 8MB (> 5MB threshold)

      const optimizedBuffer = Buffer.alloc(512); // Small optimized buffer
      mockSharpInstance.toBuffer.mockResolvedValue(optimizedBuffer);

      const result = await service.optimizeImage(largeBuffer);

      expect(result).toBe(optimizedBuffer);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({
        quality: 80,
        progressive: true,
      });
    });

    it('should handle optimization errors gracefully', async () => {
      const largeBuffer = Buffer.alloc(1024); // Small actual buffer
      Object.defineProperty(largeBuffer, 'length', { value: 8 * 1024 * 1024 }); // Mock as large

      mockSharpInstance.toBuffer.mockRejectedValue(
        new Error('Optimization failed'),
      );

      const result = await service.optimizeImage(largeBuffer);

      expect(result).toBe(largeBuffer); // Should return original on error
    });

    it('should limit dimensions to MAX_DIMENSION', async () => {
      const largeBuffer = Buffer.alloc(1024); // Small actual buffer
      Object.defineProperty(largeBuffer, 'length', { value: 8 * 1024 * 1024 }); // Mock as large

      mockSharpInstance.metadata.mockResolvedValue({
        width: 6000,
        height: 4000,
      });

      await service.optimizeImage(largeBuffer);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 4096, // Should be limited to MAX_DIMENSION
        height: 4000,
        fit: 'inside',
        withoutEnlargement: true,
      });
    });
  });
});
