import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { posts } from "./post";

export const communities = pgTable(
	"communities",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		description: text("description"),
		guidelines: text("guidelines"),
		createdAt: timestamp("createdAt")
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updatedAt")
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("communities_slug_idx").on(table.slug), index("communities_createdAt_idx").on(table.createdAt)],
);

export const communitiesRelations = relations(communities, ({ many }) => ({
	posts: many(posts),
}));
