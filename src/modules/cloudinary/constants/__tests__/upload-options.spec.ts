import { BadRequestException } from '@nestjs/common';
import { imageUploadOptions } from '../upload-options';

// Mock file type for testing (matching Multer's Express.Multer.File interface)
interface MockFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

describe('imageUploadOptions', () => {
  describe('limits', () => {
    it('should set file size limit to 10MB', () => {
      expect(imageUploadOptions.limits?.fileSize).toBe(10 * 1024 * 1024);
    });
  });

  describe('fileFilter', () => {
    let mockCallback: jest.MockedFunction<
      (error: Error | null, acceptFile: boolean) => void
    >;

    beforeEach(() => {
      mockCallback = jest.fn();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    const createMockFile = (
      originalname: string,
      mimetype: string,
    ): MockFile => ({
      fieldname: 'image',
      originalname,
      encoding: '7bit',
      mimetype,
      size: 1024,
      destination: '/tmp',
      filename: 'test',
      path: '/tmp/test',
      buffer: Buffer.from('test'),
    });

    describe('valid file extensions', () => {
      const validExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'heic',
        'heif',
        'webp',
      ];

      validExtensions.forEach((extension) => {
        it(`should accept ${extension.toUpperCase()} files`, () => {
          const mockFile = createMockFile(`test.${extension}`, 'image/jpeg');

          imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

          expect(mockCallback).toHaveBeenCalledWith(null, true);
        });

        it(`should accept ${extension.toUpperCase()} files with uppercase extension`, () => {
          const mockFile = createMockFile(
            `test.${extension.toUpperCase()}`,
            'image/jpeg',
          );

          imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

          expect(mockCallback).toHaveBeenCalledWith(null, true);
        });
      });
    });

    describe('invalid file extensions', () => {
      const invalidExtensions = ['txt', 'pdf', 'doc', 'mp4', 'exe', 'zip'];

      invalidExtensions.forEach((extension) => {
        it(`should reject ${extension.toUpperCase()} files`, () => {
          const mockFile = createMockFile(`test.${extension}`, 'text/plain');

          imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

          expect(mockCallback).toHaveBeenCalledWith(
            expect.any(BadRequestException),
            false,
          );

          const [error] = mockCallback.mock.calls[0];
          expect(error).toBeInstanceOf(BadRequestException);
          expect((error as BadRequestException).message).toBe(
            'Only image files (jpg, jpeg, png, gif, heic, heif, webp) are allowed',
          );
        });
      });
    });

    describe('valid MIME types', () => {
      const validMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/heic',
        'image/heif',
        'image/webp',
      ];

      validMimeTypes.forEach((mimetype) => {
        it(`should accept ${mimetype}`, () => {
          const mockFile = createMockFile('test.jpg', mimetype);

          imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

          expect(mockCallback).toHaveBeenCalledWith(null, true);
        });
      });
    });

    describe('invalid MIME types', () => {
      const invalidMimeTypes = [
        'text/plain',
        'application/pdf',
        'video/mp4',
        'audio/mp3',
        'application/zip',
        'text/html',
      ];

      invalidMimeTypes.forEach((mimetype) => {
        it(`should reject ${mimetype}`, () => {
          const mockFile = createMockFile('test.jpg', mimetype);

          imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

          expect(mockCallback).toHaveBeenCalledWith(
            expect.any(BadRequestException),
            false,
          );

          const [error] = mockCallback.mock.calls[0];
          expect(error).toBeInstanceOf(BadRequestException);
          expect((error as BadRequestException).message).toBe(
            'Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/heic, image/heif, image/webp',
          );
        });
      });
    });

    describe('edge cases', () => {
      it('should handle files without extension', () => {
        const mockFile = createMockFile('test', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.any(BadRequestException),
          false,
        );
      });

      it('should handle files with multiple dots in filename', () => {
        const mockFile = createMockFile('test.image.backup.jpg', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
      });

      it('should handle files with mixed case extensions', () => {
        const mockFile = createMockFile('test.JpEg', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
      });

      it('should handle empty filename', () => {
        const mockFile = createMockFile('', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.any(BadRequestException),
          false,
        );
      });

      it('should handle filename with only extension', () => {
        const mockFile = createMockFile('.jpg', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
      });
    });

    describe('both extension and MIME type validation', () => {
      it('should reject file with valid extension but invalid MIME type', () => {
        const mockFile = createMockFile('test.jpg', 'text/plain');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.any(BadRequestException),
          false,
        );

        const [error] = mockCallback.mock.calls[0];
        expect((error as BadRequestException).message).toBe(
          'Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/heic, image/heif, image/webp',
        );
      });

      it('should reject file with invalid extension but valid MIME type', () => {
        const mockFile = createMockFile('test.txt', 'image/jpeg');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(
          expect.any(BadRequestException),
          false,
        );

        const [error] = mockCallback.mock.calls[0];
        expect((error as BadRequestException).message).toBe(
          'Only image files (jpg, jpeg, png, gif, heic, heif, webp) are allowed',
        );
      });

      it('should accept file with both valid extension and MIME type', () => {
        const mockFile = createMockFile('test.png', 'image/png');

        imageUploadOptions.fileFilter?.(null, mockFile, mockCallback);

        expect(mockCallback).toHaveBeenCalledWith(null, true);
      });
    });
  });
});
