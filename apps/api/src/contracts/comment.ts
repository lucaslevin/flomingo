import { schema } from "@flomingo/db";
import { oc } from "@orpc/contract";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

const CommentInsertSchema = createInsertSchema(schema.comments);
const CommentUpdateSchema = createUpdateSchema(schema.comments);

export const commentContract = {
	create: oc
		.input(
			CommentInsertSchema.pick({
				postId: true,
				parentCommentId: true,
				content: true,
			}).extend({
				content: z.string().min(1).max(10000),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				content: z.string(),
				authorId: z.string(),
				postId: z.string(),
				parentCommentId: z.string().nullable(),
				depth: z.number(),
				createdAt: z.number(),
			}),
		),

	list: oc
		.input(
			z.object({
				postId: z.string(),
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().min(0).default(0),
			}),
		)
		.output(
			z.object({
				comments: z.array(
					z.object({
						id: z.string(),
						content: z.string(),
						authorId: z.string(),
						authorName: z.string(),
						postId: z.string(),
						parentCommentId: z.string().nullable(),
						depth: z.number(),
						createdAt: z.number(),
						score: z.number(),
						userVote: z.number(),
						bookmarkCount: z.number(),
						replies: z.array(
							z.object({
								id: z.string(),
								content: z.string(),
								authorId: z.string(),
								authorName: z.string(),
								depth: z.number(),
								createdAt: z.number(),
								score: z.number(),
								userVote: z.number(),
								bookmarkCount: z.number(),
							}),
						),
					}),
				),
				nextCursor: z.number().nullable(),
			}),
		),

	update: oc
		.input(
			CommentUpdateSchema.pick({
				id: true,
				content: true,
			}).extend({
				id: z.string(),
				content: z.string().min(1).max(10000),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				content: z.string(),
				updatedAt: z.number(),
			}),
		),

	delete: oc.input(z.object({ id: z.string() })).output(z.object({ success: z.boolean() })),

	vote: oc
		.input(
			z.object({
				commentId: z.string(),
				value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
			}),
		)
		.output(
			z.object({
				commentId: z.string(),
				newScore: z.number(),
				userVote: z.number(),
			}),
		),
};
