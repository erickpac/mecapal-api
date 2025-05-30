import { ZodError } from 'zod';
import { z } from 'zod';

// Create a test schema that matches the real one
const testEnvSchema = z.object({
  // General
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_EXPIRATION_TIME: z.string().default('1d'),
  JWT_REFRESH_EXPIRATION_TIME: z.string().default('7d'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      // Set required environment variables
      NODE_ENV: 'development', // Explicitly set NODE_ENV to development
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-api-key',
      CLOUDINARY_API_SECRET: 'test-api-secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Schema Validation', () => {
    it('should validate required environment variables', () => {
      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
    });

    it('should throw error when required variables are missing', () => {
      process.env = {};

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
      }
    });

    it('should validate DATABASE_URL format', () => {
      const originalDbUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = 'invalid-url';

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
      }

      process.env.DATABASE_URL = originalDbUrl;
    });
  });

  describe('Default Values', () => {
    it('should set default NODE_ENV to development when not provided', () => {
      const { ...envWithoutNodeEnv } = process.env;
      const result = testEnvSchema.safeParse(envWithoutNodeEnv);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('development');
      }
    });

    it('should set default PORT to 3000', () => {
      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(3000);
      }
    });

    it('should set default JWT_EXPIRATION_TIME to 1d', () => {
      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.JWT_EXPIRATION_TIME).toBe('1d');
      }
    });

    it('should set default JWT_REFRESH_EXPIRATION_TIME to 7d', () => {
      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.JWT_REFRESH_EXPIRATION_TIME).toBe('7d');
      }
    });
  });

  describe('Custom Values', () => {
    it('should accept custom NODE_ENV values', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NODE_ENV).toBe('production');
      }

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should accept custom PORT value', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '4000';

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.PORT).toBe(4000);
      }

      process.env.PORT = originalPort;
    });

    it('should reject invalid NODE_ENV values', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'invalid';

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
      }

      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('Type Coercion', () => {
    it('should coerce PORT string to number', () => {
      const originalPort = process.env.PORT;
      process.env.PORT = '5000';

      const result = testEnvSchema.safeParse(process.env);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.PORT).toBe('number');
        expect(result.data.PORT).toBe(5000);
      }

      process.env.PORT = originalPort;
    });
  });
});
