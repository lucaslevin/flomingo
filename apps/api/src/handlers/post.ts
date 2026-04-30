import { generatePostEmbedding } from "@flomingo/ai";
import { db, schema } from "@flomingo/db";
import { ORPCError } from "@orpc/server";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { authed, pub } from "../procedures";

export const createPost = authed.post.create.handler(async ({ input, context }) => {
	const embedding = await generatePostEmbedding(input.title, input.content);

	await db.insert(schema.posts).values({
		title: input.title,
		content: input.content,
		authorId: context.user.id,
		communityId: input.communityId,
		embedding,
	});

	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.title, input.title),
		orderBy: (posts, { desc }) => desc(posts.createdAt),
	});

	if (!post) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create post" });
	}

	return {
		id: post.id,
		title: post.title,
		content: post.content,
		authorId: post.authorId,
		communityId: post.communityId,
		createdAt: post.createdAt.getTime(),
	};
});

export const byIdPost = pub.post.byId.handler(async ({ input }) => {
	const post = await db.query.posts.findFirst({
		where: (posts, { and, eq, isNull }) => and(eq(posts.id, input.id), isNull(posts.deletedAt)),
		with: {
			author: true,
			community: true,
			attachments: true,
		},
	});

	if (!post) {
		throw new ORPCError("NOT_FOUND", { message: "Post not found" });
	}

	const [votesResult, bookmarkResult] = await Promise.all([
		db
			.select({ score: sql<number>`coalesce(sum(${schema.votes.value}), 0)` })
			.from(schema.votes)
			.where(eq(schema.votes.targetId, input.id)),
		db
			.select({ count: sql<number>`count(*)` })
			.from(schema.bookmarks)
			.where(and(eq(schema.bookmarks.targetId, input.id), eq(schema.bookmarks.targetType, "post"))),
	]);

	const score = Number(votesResult[0]?.score ?? 0);
	const bookmarkCount = Number(bookmarkResult[0]?.count ?? 0);

	return {
		id: post.id,
		title: post.title,
		content: post.content,
		authorId: post.authorId,
		authorName: post.author.name,
		communityId: post.communityId,
		communitySlug: post.community.slug,
		createdAt: Number(post.createdAt.getTime()),
		updatedAt: Number(post.updatedAt.getTime()),
		score,
		userVote: 0,
		bookmarkCount,
		attachments: (post.attachments ?? []).map((a) => ({
			id: a.id,
			type: a.type,
			url: a.url,
			thumbnailUrl: a.thumbnailUrl,
			order: a.order,
			ogTitle: a.ogTitle,
			ogDescription: a.ogDescription,
			ogImageUrl: a.ogImageUrl,
		})),
	};
});

export const listPost = pub.post.list.handler(async ({ input }) => {
	const limit = input.limit ?? 20;
	const cursor = input.cursor ?? 0;

	const posts = await db.query.posts.findMany({
		where: (posts, { isNull }) => isNull(posts.deletedAt),
		with: {
			author: true,
			community: true,
		},
		orderBy: (posts, { desc }) => desc(posts.createdAt),
		limit: limit + 1,
		offset: cursor,
	});

	const hasMore = posts.length > limit;
	const results = hasMore ? posts.slice(0, -1) : posts;

	if (results.length === 0) {
		return {
			posts: [],
			nextCursor: hasMore ? cursor + limit : null,
		};
	}

	const postIds = results.map((p) => p.id);

	const [voteRows, commentRows, bookmarkRows, attachmentRows] = await Promise.all([
		db
			.select({ targetId: schema.votes.targetId, score: sql<number>`coalesce(sum(${schema.votes.value}), 0)` })
			.from(schema.votes)
			.where(inArray(schema.votes.targetId, postIds))
			.groupBy(schema.votes.targetId),
		db
			.select({ postId: schema.comments.postId, count: count(schema.comments.id) })
			.from(schema.comments)
			.where(inArray(schema.comments.postId, postIds))
			.groupBy(schema.comments.postId),
		db
			.select({ targetId: schema.bookmarks.targetId, count: count(schema.bookmarks.id) })
			.from(schema.bookmarks)
			.where(and(inArray(schema.bookmarks.targetId, postIds), eq(schema.bookmarks.targetType, "post")))
			.groupBy(schema.bookmarks.targetId),
		db
			.select({ postId: schema.attachments.postId, count: count(schema.attachments.id) })
			.from(schema.attachments)
			.where(inArray(schema.attachments.postId, postIds))
			.groupBy(schema.attachments.postId),
	]);

	const scoreMap = new Map(voteRows.map((v) => [v.targetId, v.score]));
	const commentCountMap = new Map(commentRows.map((c) => [c.postId, c.count]));
	const bookmarkCountMap = new Map(bookmarkRows.map((b) => [b.targetId, b.count]));
	const attachmentCountMap = new Map(attachmentRows.map((a) => [a.postId, a.count]));

	const postsWithCounts = results.map((post) => ({
		id: post.id,
		title: post.title,
		authorId: post.authorId,
		authorName: post.author.name,
		communityId: post.communityId,
		communitySlug: post.community.slug,
		createdAt: Number(post.createdAt.getTime()),
		score: Number(scoreMap.get(post.id)) || 0,
		commentCount: Number(commentCountMap.get(post.id)) || 0,
		bookmarkCount: Number(bookmarkCountMap.get(post.id)) || 0,
		attachmentCount: Number(attachmentCountMap.get(post.id)) || 0,
	}));

	return {
		posts: postsWithCounts,
		nextCursor: hasMore ? Number(cursor + limit) : null,
	};
});

export const updatePost = authed.post.update.handler(async ({ input, context }) => {
	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, input.id),
	});

	if (!post) {
		throw new ORPCError("NOT_FOUND", { message: "Post not found" });
	}

	if (post.authorId !== context.user.id) {
		throw new ORPCError("FORBIDDEN", { message: "Not authorized" });
	}

	const newTitle = input.title ?? post.title;
	const newContent = input.content ?? post.content;
	const embedding = await generatePostEmbedding(newTitle, newContent);

	await db
		.update(schema.posts)
		.set({
			title: newTitle,
			content: newContent,
			embedding,
		})
		.where(eq(schema.posts.id, input.id));

	const updated = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, input.id),
	});

	if (!updated) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update post" });
	}

	return {
		id: updated.id,
		title: updated.title,
		content: updated.content,
		updatedAt: updated.updatedAt.getTime(),
	};
});

export const deletePost = authed.post.delete.handler(async ({ input, context }) => {
	const post = await db.query.posts.findFirst({
		where: (posts, { eq }) => eq(posts.id, input.id),
	});

	if (!post) {
		throw new ORPCError("NOT_FOUND", { message: "Post not found" });
	}

	if (post.authorId !== context.user.id) {
		throw new ORPCError("FORBIDDEN", { message: "Not authorized" });
	}

	await db.update(schema.posts).set({ deletedAt: new Date() }).where(eq(schema.posts.id, input.id));

	return { success: true };
});

export const votePost = authed.post.vote.handler(async ({ input, context }) => {
	const existing = await db
		.select()
		.from(schema.votes)
		.where(and(eq(schema.votes.targetId, input.postId), eq(schema.votes.targetType, "post"), eq(schema.votes.userId, context.user.id)))
		.limit(1);

	if (input.value === 0) {
		if (existing[0]) {
			await db.delete(schema.votes).where(eq(schema.votes.id, existing[0].id));
		}
	} else if (existing[0]) {
		await db.update(schema.votes).set({ value: input.value }).where(eq(schema.votes.id, existing[0].id));
	} else {
		await db.insert(schema.votes).values({
			userId: context.user.id,
			targetId: input.postId,
			targetType: "post",
			value: input.value,
		});
	}

	const votes = await db
		.select({ value: sql<number>`sum(${schema.votes.value})` })
		.from(schema.votes)
		.where(eq(schema.votes.targetId, input.postId));

	return {
		postId: input.postId,
		newScore: Number(votes[0]?.value) || 0,
		userVote: input.value,
	};
});

export const postRouter = {
	create: createPost,
	byId: byIdPost,
	list: listPost,
	update: updatePost,
	delete: deletePost,
	vote: votePost,
};
