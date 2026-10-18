import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  MONGO_HOST: z.string(),
  MONGO_USER: z.string(),
  MONGO_PASSWORD: z.string(),
  MONGO_DB: z.string(),
  MONGO_PORT: z.coerce.number().default(27017),
  APP_PORT: z.coerce.number().default(3000),
});

const validateEnv = envSchema.safeParse(process.env);

if (!validateEnv.success) {
  console.error('Invalid environment variables:', z.treeifyError(validateEnv.error));
  process.exit(1);
}

export const env = validateEnv.data;