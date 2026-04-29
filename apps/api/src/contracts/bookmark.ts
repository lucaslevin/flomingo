import { oc } from "@orpc/contract";
import { z } from "zod";

export const bookmarkContract = {
	create: oc
		.input(
			z.object({
				targetId: z.string(),
				targetType: z.enum(["post", "comment"]),
			}),
		)
		.output(z.object({ success: z.literal(true) })),

	list: oc
		.input(
			z.object({
				type: z.enum(["all", "posts", "comments"]).default("all"),
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().min(0).default(0),
			}),
		)
		.output(
			z.object({
				bookmarks: z.array(
					z.union([
						z.object({
							type: z.literal("post"),
							id: z.string(),
							targetId: z.string(),
							title: z.string(),
							content: z.string(),
							authorId: z.string(),
							authorName: z.string(),
							communityId: z.string(),
							communitySlug: z.string(),
							createdAt: z.number(),
							bookmarkedAt: z.number(),
						}),
						z.object({
							type: z.literal("comment"),
							id: z.string(),
							targetId: z.string(),
							content: z.string(),
							authorId: z.string(),
							authorName: z.string(),
							postId: z.string(),
							createdAt: z.number(),
							bookmarkedAt: z.number(),
						}),
					]),
				),
				nextCursor: z.number().nullable(),
			}),
		),

	delete: oc.input(z.object({ targetId: z.string() })).output(z.object({ success: z.literal(true) })),
};