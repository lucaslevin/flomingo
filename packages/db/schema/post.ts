import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, vector } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { attachments } from "./attachment";
import { users } from "./auth";
import { comments } from "./comment";
import { communities } from "./community";
import { votes } from "./vote";

export const posts = pgTable(
	"posts",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		title: text("title").notNull(),
		content: text("content").notNull(),
		authorId: text("authorId").notNull(),
		communityId: text("communityId").notNull(),
		embedding: vector("embedding", { dimensions: 1024 }),
		createdAt: timestamp("createdAt")
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: timestamp("updatedAt")
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
			.notNull(),
		deletedAt: timestamp("deletedAt"),
	},
	(table) => [
		index("posts_communityId_idx").on(table.communityId),
		index("posts_authorId_idx").on(table.authorId),
		index("posts_createdAt_idx").on(table.createdAt),
		index("posts_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
	],
);

export const postsRelations = relations(posts, ({ one, many }) => ({
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id],
	}),
	community: one(communities, {
		fields: [posts.communityId],
		references: [communities.id],
	}),
	comments: many(comments),
	votes: many(votes),
	attachments: many(attachments),
}));
