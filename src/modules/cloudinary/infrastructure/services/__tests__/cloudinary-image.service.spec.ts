import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { CloudinaryImageService } from '../cloudinary-image.service';
import { CloudinaryService } from '../cloudinary.service';
import { EntityWithImage } from '../../../domain/interfaces/entity-with-image.interface';
import { EntityRepository } from '../../../domain/repositories/entity.repository';

// Mock entity for testing
interface MockEntity extends EntityWithImage {
  id: string;
  imageUrl?: string;
  name: string;
}

/* eslint-disable @typescript-eslint/unbound-method */
describe('CloudinaryImageService', () => {
  let service: CloudinaryImageService;
  let cloudinaryService: jest.Mocked<CloudinaryService>;
  let mockRepository: jest.Mocked<EntityRepository<MockEntity>>;

  beforeEach(async () => {
    const mockCloudinaryService = {
      validateImage: jest.fn(),
      optimizeImage: jest.fn(),
      uploadImage: jest.fn(),
      deleteImage: jest.fn(),
      extractPublicId: jest.fn(),
    };

    mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudinaryImageService,
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<CloudinaryImageService>(CloudinaryImageService);
    cloudinaryService = module.get<CloudinaryService>(
      CloudinaryService,
    ) as jest.Mocked<CloudinaryService>;

    // Mock logger to avoid actual logging in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('uploadEntityImage - Single Image Entity (Update)', () => {
    const testBuffer = Buffer.from('test image data');
    const optimizedBuffer = Buffer.from('optimized image data');
    const mockEntity: MockEntity = {
      id: '1',
      name: 'Test Entity',
      imageUrl: 'https://cloudinary.com/old-image.jpg',
    };

    const mockUploadResponse = {
      public_id: 'new-image-id',
      secure_url: 'https://cloudinary.com/new-image.jpg',
    } as UploadApiResponse;

    const mockDeleteResponse = {} as UploadApiResponse;

    beforeEach(() => {
      cloudinaryService.validateImage.mockResolvedValue(true);
      cloudinaryService.optimizeImage.mockResolvedValue(optimizedBuffer);
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadResponse);
    });

    it('should upload image and update entity successfully', async () => {
      const updatedEntity = {
        ...mockEntity,
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);
      cloudinaryService.extractPublicId.mockReturnValue('old-image-id');
      cloudinaryService.deleteImage.mockResolvedValue(mockDeleteResponse);

      const responseTransformer = (entity: MockEntity) => ({
        id: entity.id,
        name: entity.name,
        image: entity.imageUrl,
      });

      const result = await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        responseTransformer,
      });

      expect(cloudinaryService.validateImage).toHaveBeenCalledWith(testBuffer);
      expect(cloudinaryService.optimizeImage).toHaveBeenCalledWith(testBuffer);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        optimizedBuffer,
        'test-folder',
        undefined,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.update).toHaveBeenCalledWith('1', {
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      });
      expect(cloudinaryService.extractPublicId).toHaveBeenCalledWith(
        'https://cloudinary.com/old-image.jpg',
      );
      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(
        'old-image-id',
      );

      expect(result).toEqual({
        id: '1',
        name: 'Test Entity',
        image: 'https://cloudinary.com/new-image.jpg',
      });
    });

    it('should upload image with transformation options', async () => {
      const updatedEntity = {
        ...mockEntity,
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };
      const imageOptions = {
        width: 800,
        height: 600,
        crop: 'fill' as const,
      };

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);
      cloudinaryService.extractPublicId.mockReturnValue('old-image-id');
      cloudinaryService.deleteImage.mockResolvedValue(mockDeleteResponse);

      const responseTransformer = (entity: MockEntity) => entity;

      await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        imageOptions,
        responseTransformer,
      });

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        optimizedBuffer,
        'test-folder',
        imageOptions,
      );
    });

    it('should throw error when entity not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const responseTransformer = (entity: MockEntity) => entity;

      await expect(
        service.uploadEntityImage({
          entityId: '1',
          repository: mockRepository,
          imageBuffer: testBuffer,
          cloudinaryFolder: 'test-folder',
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Entity with ID 1 not found');

      expect(mockRepository.update).not.toHaveBeenCalled();
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
    });

    it('should handle entity without existing image', async () => {
      const entityWithoutImage: MockEntity = {
        id: '1',
        name: 'Test Entity',
      };
      const updatedEntity = {
        ...entityWithoutImage,
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.findById.mockResolvedValue(entityWithoutImage);
      mockRepository.update.mockResolvedValue(updatedEntity);

      const responseTransformer = (entity: MockEntity) => entity;

      await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        responseTransformer,
      });

      expect(cloudinaryService.extractPublicId).not.toHaveBeenCalled();
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();
    });

    it('should handle old image deletion errors gracefully', async () => {
      const updatedEntity = {
        ...mockEntity,
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);
      cloudinaryService.extractPublicId.mockReturnValue('old-image-id');
      cloudinaryService.deleteImage.mockRejectedValue(
        new Error('Delete failed'),
      );

      const responseTransformer = (entity: MockEntity) => entity;
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      const result = await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        responseTransformer,
      });

      expect(result).toEqual(updatedEntity);
      expect(loggerSpy).toHaveBeenCalledWith(
        'Error deleting old image: Delete failed',
      );
    });

    it('should handle non-Error exceptions in image deletion', async () => {
      const updatedEntity = {
        ...mockEntity,
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.findById.mockResolvedValue(mockEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);
      cloudinaryService.extractPublicId.mockReturnValue('old-image-id');
      cloudinaryService.deleteImage.mockRejectedValue('String error');

      const responseTransformer = (entity: MockEntity) => entity;
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        responseTransformer,
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error deleting old image: String error',
      );
    });
  });

  describe('uploadEntityImage - Multi Image Entity (Create)', () => {
    const testBuffer = Buffer.from('test image data');
    const optimizedBuffer = Buffer.from('optimized image data');

    const mockUploadResponse = {
      public_id: 'new-image-id',
      secure_url: 'https://cloudinary.com/new-image.jpg',
    } as UploadApiResponse;

    beforeEach(() => {
      cloudinaryService.validateImage.mockResolvedValue(true);
      cloudinaryService.optimizeImage.mockResolvedValue(optimizedBuffer);
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadResponse);
    });

    it('should create new entity with image', async () => {
      const newEntity: MockEntity = {
        id: '1',
        name: 'New Entity',
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.create.mockResolvedValue(newEntity);

      const responseTransformer = (entity: MockEntity) => ({
        id: entity.id,
        name: entity.name,
        photo: entity.imageUrl,
      });

      const additionalData = { name: 'New Entity' };

      const result = await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        createNewEntity: true,
        additionalData,
        responseTransformer,
      });

      expect(cloudinaryService.validateImage).toHaveBeenCalledWith(testBuffer);
      expect(cloudinaryService.optimizeImage).toHaveBeenCalledWith(testBuffer);
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(
        optimizedBuffer,
        'test-folder',
        undefined,
      );
      expect(mockRepository.create).toHaveBeenCalledWith('1', {
        imageUrl: 'https://cloudinary.com/new-image.jpg',
        name: 'New Entity',
      });
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(cloudinaryService.deleteImage).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: '1',
        name: 'New Entity',
        photo: 'https://cloudinary.com/new-image.jpg',
      });
    });

    it('should create new entity without additional data', async () => {
      const newEntity: MockEntity = {
        id: '1',
        name: '',
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      };

      mockRepository.create.mockResolvedValue(newEntity);

      const responseTransformer = (entity: MockEntity) => entity;

      await service.uploadEntityImage({
        entityId: '1',
        repository: mockRepository,
        imageBuffer: testBuffer,
        cloudinaryFolder: 'test-folder',
        imageField: 'imageUrl',
        createNewEntity: true,
        responseTransformer,
      });

      expect(mockRepository.create).toHaveBeenCalledWith('1', {
        imageUrl: 'https://cloudinary.com/new-image.jpg',
      });
    });
  });

  describe('Error Handling', () => {
    const testBuffer = Buffer.from('test image data');

    it('should propagate validation errors', async () => {
      cloudinaryService.validateImage.mockRejectedValue(
        new Error('Invalid image'),
      );

      const responseTransformer = (entity: MockEntity) => entity;

      await expect(
        service.uploadEntityImage({
          entityId: '1',
          repository: mockRepository,
          imageBuffer: testBuffer,
          cloudinaryFolder: 'test-folder',
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Invalid image');

      expect(cloudinaryService.optimizeImage).not.toHaveBeenCalled();
      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should propagate optimization errors', async () => {
      cloudinaryService.validateImage.mockResolvedValue(true);
      cloudinaryService.optimizeImage.mockRejectedValue(
        new Error('Optimization failed'),
      );

      const responseTransformer = (entity: MockEntity) => entity;

      await expect(
        service.uploadEntityImage({
          entityId: '1',
          repository: mockRepository,
          imageBuffer: testBuffer,
          cloudinaryFolder: 'test-folder',
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Optimization failed');

      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
    });

    it('should propagate upload errors', async () => {
      const optimizedBuffer = Buffer.from('optimized');
      cloudinaryService.validateImage.mockResolvedValue(true);
      cloudinaryService.optimizeImage.mockResolvedValue(optimizedBuffer);
      cloudinaryService.uploadImage.mockRejectedValue(
        new Error('Upload failed'),
      );

      const responseTransformer = (entity: MockEntity) => entity;

      await expect(
        service.uploadEntityImage({
          entityId: '1',
          repository: mockRepository,
          imageBuffer: testBuffer,
          cloudinaryFolder: 'test-folder',
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Upload failed');

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const optimizedBuffer = Buffer.from('optimized');
      const mockUploadResponse = {
        public_id: 'new-id',
        secure_url: 'https://cloudinary.com/new-image.jpg',
      } as UploadApiResponse;

      cloudinaryService.validateImage.mockResolvedValue(true);
      cloudinaryService.optimizeImage.mockResolvedValue(optimizedBuffer);
      cloudinaryService.uploadImage.mockResolvedValue(mockUploadResponse);
      mockRepository.findById.mockResolvedValue({
        id: '1',
        name: 'Test',
      } as MockEntity);
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      const responseTransformer = (entity: MockEntity) => entity;

      await expect(
        service.uploadEntityImage({
          entityId: '1',
          repository: mockRepository,
          imageBuffer: testBuffer,
          cloudinaryFolder: 'test-folder',
          imageField: 'imageUrl',
          responseTransformer,
        }),
      ).rejects.toThrow('Update failed');
    });
  });
});
