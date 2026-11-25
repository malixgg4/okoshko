// Centralized env validation with zod. Imported only by server code
// (route handlers / server actions), never from client components.
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),

  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(16),

  CRON_SECRET: z.string().min(8).default('dev-cron-secret'),

  // Telegram (stage 5)
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().default('OkoshkoBot'),

  // Payments (stage 6)
  PAYMENT_PROVIDER: z.enum(['mock', 'yookassa']).default('mock'),
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validated env. Throws a readable error on the first bad access. */
export function getEnv(): Env {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid environment variables: ${issues}`);
  }
  cached = result.data;
  return cached;
}
