import type { DBInstance } from "./db";

export interface AppBindings {
  Bindings: Env & {
    D1_INTERNAL_SECRET: string;
  };
  Variables: {
    drizzle: DBInstance;
  };
}