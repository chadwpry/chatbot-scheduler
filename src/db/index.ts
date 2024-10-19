import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '@/lib/env.mjs';

export const db = drizzle({
    connection: {
        connectionString: env.DATABASE_URL,
        ssl: true,
    }
});
