import type { Config } from "drizzle-kit";
import { env } from "@/lib/env.mjs";

export default {
  schema: "./src/db/schema",
  dialect: "postgresql",
  out: "./src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  }
} satisfies Config;