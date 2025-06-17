import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  TW_INTERNAL_SECRET: z.string().min(1),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().regex(/^\d+$/).transform(Number).default("3000")
  // Add any other environment variables your application needs
});

export const env = envSchema.parse(process.env);

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
