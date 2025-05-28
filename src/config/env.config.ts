import { z } from 'zod';

const envSchema = z.object({
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
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
