import {
  CLOUDINARY_FOLDERS,
  getCloudinaryFolderPath,
  getTempFolderPath,
} from '../cloudinary-folders';

describe('cloudinary-folders', () => {
  describe('CLOUDINARY_FOLDERS constant', () => {
    describe('USERS folders', () => {
      it('should have correct AVATARS path', () => {
        expect(CLOUDINARY_FOLDERS.USERS.AVATARS).toBe('mecapal/users/avatars');
      });

      it('should have correct DOCUMENTS path', () => {
        expect(CLOUDINARY_FOLDERS.USERS.DOCUMENTS).toBe(
          'mecapal/users/documents',
        );
      });

      it('should have correct IDENTIFICATION path', () => {
        expect(CLOUDINARY_FOLDERS.USERS.IDENTIFICATION).toBe(
          'mecapal/users/identification',
        );
      });
    });

    describe('VEHICLES folders', () => {
      it('should have correct MAIN path', () => {
        expect(CLOUDINARY_FOLDERS.VEHICLES.MAIN).toBe('mecapal/vehicles/main');
      });

      it('should have correct DOCUMENTS path', () => {
        expect(CLOUDINARY_FOLDERS.VEHICLES.DOCUMENTS).toBe(
          'mecapal/vehicles/documents',
        );
      });

      it('should have correct DAMAGES path', () => {
        expect(CLOUDINARY_FOLDERS.VEHICLES.DAMAGES).toBe(
          'mecapal/vehicles/damages',
        );
      });

      it('should have correct INSPECTIONS path', () => {
        expect(CLOUDINARY_FOLDERS.VEHICLES.INSPECTIONS).toBe(
          'mecapal/vehicles/inspections',
        );
      });
    });

    describe('SERVICES folders', () => {
      it('should have correct BEFORE path', () => {
        expect(CLOUDINARY_FOLDERS.SERVICES.BEFORE).toBe(
          'mecapal/services/before',
        );
      });

      it('should have correct AFTER path', () => {
        expect(CLOUDINARY_FOLDERS.SERVICES.AFTER).toBe(
          'mecapal/services/after',
        );
      });

      it('should have correct REPORTS path', () => {
        expect(CLOUDINARY_FOLDERS.SERVICES.REPORTS).toBe(
          'mecapal/services/reports',
        );
      });
    });

    describe('TEMP folder', () => {
      it('should have correct TEMP path', () => {
        expect(CLOUDINARY_FOLDERS.TEMP).toBe('mecapal/temp');
      });
    });
  });

  describe('getCloudinaryFolderPath function', () => {
    it('should join single path segment', () => {
      const result = getCloudinaryFolderPath('folder');
      expect(result).toBe('folder');
    });

    it('should join multiple path segments', () => {
      const result = getCloudinaryFolderPath('folder', 'subfolder');
      expect(result).toBe('folder/subfolder');
    });

    it('should join many path segments', () => {
      const result = getCloudinaryFolderPath('a', 'b', 'c', 'd');
      expect(result).toBe('a/b/c/d');
    });

    it('should handle empty array', () => {
      const result = getCloudinaryFolderPath();
      expect(result).toBe('');
    });

    it('should handle empty strings in segments', () => {
      const result = getCloudinaryFolderPath('folder', '', 'subfolder');
      expect(result).toBe('folder//subfolder');
    });

    it('should work with existing folder constants', () => {
      const result = getCloudinaryFolderPath(
        CLOUDINARY_FOLDERS.USERS.AVATARS,
        'user-123',
        'profile',
      );
      expect(result).toBe('mecapal/users/avatars/user-123/profile');
    });
  });

  describe('getTempFolderPath function', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1692000000000);
      jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should generate temp folder path without prefix', () => {
      const result = getTempFolderPath();
      expect(result).toBe('mecapal/temp/1692000000000-4fzzzx');
    });

    it('should generate temp folder path with prefix', () => {
      const result = getTempFolderPath('upload');
      expect(result).toBe('mecapal/temp/1692000000000-4fzzzx/upload');
    });

    it('should generate temp folder path with complex prefix', () => {
      const result = getTempFolderPath('user-123/avatar');
      expect(result).toBe('mecapal/temp/1692000000000-4fzzzx/user-123/avatar');
    });

    it('should generate unique paths on different calls', () => {
      const result1 = getTempFolderPath();

      jest.spyOn(Date, 'now').mockReturnValue(1692000001000);
      jest.spyOn(Math, 'random').mockReturnValue(0.987654321);

      const result2 = getTempFolderPath();

      expect(result1).not.toBe(result2);
      expect(result1).toBe('mecapal/temp/1692000000000-4fzzzx');
      expect(result2).toBe('mecapal/temp/1692000001000-zk0000');
    });

    it('should handle empty string prefix', () => {
      const result = getTempFolderPath('');
      expect(result).toBe('mecapal/temp/1692000000000-4fzzzx');
    });

    it('should always start with TEMP folder path', () => {
      const result = getTempFolderPath();
      expect(result).toMatch(new RegExp(`^${CLOUDINARY_FOLDERS.TEMP}`));
    });
  });
});
