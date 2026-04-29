import { SQL } from "bun";
import { type BunSQLDatabase, drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

declare global {
	var globalDb: BunSQLDatabase<typeof schema> | undefined;
}

if (!globalThis.globalDb) {
	const client = new SQL(process.env.DATABASE_URL as string);
	globalThis.globalDb = drizzle({ client, schema });
}

export const db = globalThis.globalDb;

export { schema };
