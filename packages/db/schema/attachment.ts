import { relations } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { posts } from "./post";

export const attachmentTypeEnum = pgEnum("attachment_type", ["image", "gif", "link"]);

export const attachments = pgTable(
	"attachments",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		postId: text("postId").notNull(),
		type: attachmentTypeEnum("type").notNull(),
		url: text("url").notNull(),
		thumbnailUrl: text("thumbnailUrl"),
		s3Key: text("s3Key"),
		order: integer("order").default(0).notNull(),
		ogTitle: text("ogTitle"),
		ogDescription: text("ogDescription"),
		ogImageUrl: text("ogImageUrl"),
		createdAt: timestamp("createdAt")
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [index("attachments_postId_idx").on(table.postId), index("attachments_order_idx").on(table.order)],
);

export const attachmentsRelations = relations(attachments, ({ one }) => ({
	post: one(posts, {
		fields: [attachments.postId],
		references: [posts.id],
	}),
}));

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;
