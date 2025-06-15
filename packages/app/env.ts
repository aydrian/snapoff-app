import { z } from "zod";

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, "CLOUDFLARE_ACCOUNT_ID is required"),
  CLOUDFLARE_DATABASE_ID: z
    .string()
    .min(1, "CLOUDFLARE_DATABASE_ID is required"),
  CLOUDFLARE_D1_TOKEN: z.string().min(1, "CLOUDFLARE_D1_TOKEN is required")
});

export const env = envSchema.parse(process.env);

// Type for the validated environment
export type Env = z.infer<typeof envSchema>;
