import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, vector } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./auth";
import { posts } from "./post";
import { votes } from "./vote";

export const comments = pgTable(
	"comments",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		content: text("content").notNull(),
		authorId: text("authorId").notNull(),
		postId: text("postId").notNull(),
		parentCommentId: text("parentCommentId"),
		depth: text("depth").default("0").notNull(),
		embedding: vector("embedding", { dimensions: 1536 }),
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
		index("comments_postId_idx").on(table.postId),
		index("comments_parentCommentId_idx").on(table.parentCommentId),
		index("comments_authorId_idx").on(table.authorId),
		index("comments_createdAt_idx").on(table.createdAt),
		index("comments_embedding_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
	],
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id],
	}),
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id],
	}),
	parent: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
	}),
	children: many(comments),
	votes: many(votes),
}));
