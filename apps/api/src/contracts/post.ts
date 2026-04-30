import { oc } from "@orpc/contract";
import { z } from "zod";

export const postContract = {
	create: oc
		.input(
			z.object({
				title: z.string().min(1).max(300),
				content: z.string().min(1).max(40000),
				communityId: z.string(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				title: z.string(),
				content: z.string(),
				authorId: z.string(),
				communityId: z.string(),
				createdAt: z.number(),
			}),
		),

	byId: oc.input(z.object({ id: z.string() })).output(
		z.object({
			id: z.string(),
			title: z.string(),
			content: z.string(),
			authorId: z.string(),
			authorName: z.string(),
			communityId: z.string(),
			communitySlug: z.string(),
			createdAt: z.number(),
			updatedAt: z.number(),
			score: z.number(),
			userVote: z.number(),
			bookmarkCount: z.number(),
		}),
	),

	list: oc
		.input(
			z.object({
				communitySlug: z.string().optional(),
				limit: z.number().int().min(1).max(100).default(20),
				cursor: z.number().int().min(0).default(0),
			}),
		)
		.output(
			z.object({
				posts: z.array(
					z.object({
						id: z.string(),
						title: z.string(),
						authorId: z.string(),
						authorName: z.string(),
						communityId: z.string(),
						communitySlug: z.string(),
						createdAt: z.number(),
						score: z.number(),
						commentCount: z.number(),
						bookmarkCount: z.number(),
					}),
				),
				nextCursor: z.number().nullable(),
			}),
		),

	update: oc
		.input(
			z.object({
				id: z.string(),
				title: z.string().min(1).max(300).optional(),
				content: z.string().min(1).max(40000).optional(),
			}),
		)
		.output(
			z.object({
				id: z.string(),
				title: z.string(),
				content: z.string(),
				updatedAt: z.number(),
			}),
		),

	delete: oc.input(z.object({ id: z.string() })).output(z.object({ success: z.boolean() })),

	vote: oc
		.input(
			z.object({
				postId: z.string(),
				value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
			}),
		)
		.output(
			z.object({
				postId: z.string(),
				newScore: z.number(),
				userVote: z.number(),
			}),
		),
};