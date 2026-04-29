import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const bookmarks = pgTable(
	"bookmarks",
	{
		id: text("id").primaryKey().$defaultFn(() => nanoid()),
		userId: text("userId").notNull(),
		targetId: text("targetId").notNull(),
		targetType: text("targetType").notNull(),
		createdAt: timestamp("createdAt").notNull().$defaultFn(() => new Date()),
	},
	(table) => [
		uniqueIndex("bookmarks_user_target_idx").on(table.userId, table.targetId, table.targetType),
		index("bookmarks_target_idx").on(table.targetId, table.targetType),
	],
);