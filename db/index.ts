import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

// Prevent multiple connections in development hot-reloading
let client: postgres.Sql;

if (process.env.NODE_ENV === 'production') {
  client = postgres(connectionString, {
    prepare: false,
  });
} else {
  const globalRef = global as any;
  if (!globalRef.postgresClient) {
    globalRef.postgresClient = postgres(connectionString, {
      prepare: false,
    });
  }
  client = globalRef.postgresClient;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
