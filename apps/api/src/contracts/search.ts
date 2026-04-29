import { oc } from "@orpc/contract";
import { z } from "zod";

export const searchContract = {
	query: oc
		.input(
			z.object({
				query: z.string().min(1).max(500),
				type: z.enum(["all", "posts", "comments"]).default("all"),
				limit: z.number().int().min(1).max(100).default(20),
			}),
		)
		.output(
			z.object({
				results: z.array(
					z.union([
						z.object({
							type: z.literal("post"),
							id: z.string(),
							title: z.string(),
							content: z.string(),
							authorId: z.string(),
							authorName: z.string(),
							communityId: z.string(),
							communitySlug: z.string(),
							similarity: z.number(),
							createdAt: z.number(),
						}),
						z.object({
							type: z.literal("comment"),
							id: z.string(),
							content: z.string(),
							authorId: z.string(),
							authorName: z.string(),
							postId: z.string(),
							similarity: z.number(),
							createdAt: z.number(),
						}),
					]),
				),
				query: z.string(),
			}),
		),
};
