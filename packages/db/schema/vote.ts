import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./auth";

export const votes = pgTable(
	"votes",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text("userId").notNull(),
		targetId: text("targetId").notNull(),
		targetType: text("targetType").notNull(),
		value: integer("value").notNull(),
		createdAt: timestamp("createdAt")
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [uniqueIndex("votes_user_target_idx").on(table.userId, table.targetId, table.targetType), index("votes_targetId_idx").on(table.targetId)],
);

export const votesRelations = relations(votes, ({ one }) => ({
	user: one(users, {
		fields: [votes.userId],
		references: [users.id],
	}),
}));
