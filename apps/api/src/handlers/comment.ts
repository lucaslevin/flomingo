import { db, schema } from "@flomingo/db";
import { generateEmbedding } from "@flomingo/ai";
import { ORPCError } from "@orpc/server";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { authed, pub } from "../procedures";

export const createComment = authed.comment.create.handler(async ({ input, context }) => {
	const depth = input.parentCommentId ? 1 : 0;
	const embedding = await generateEmbedding(input.content);

	await db.insert(schema.comments).values({
		content: input.content,
		authorId: context.user.id,
		postId: input.postId,
		parentCommentId: input.parentCommentId,
		depth: String(depth),
		embedding,
	});

	const comment = await db.query.comments.findFirst({
		where: (comments, { eq }) => eq(comments.content, input.content),
		orderBy: (comments, { desc }) => desc(comments.createdAt),
	});

	if (!comment) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create comment" });
	}

	return {
		id: comment.id,
		content: comment.content,
		authorId: comment.authorId,
		postId: comment.postId,
		parentCommentId: comment.parentCommentId,
		depth: Number(comment.depth),
		createdAt: comment.createdAt.getTime(),
	};
});

export const listComment = pub.comment.list.handler(async ({ input }) => {
	const limit = input.limit ?? 20;
	const cursor = input.cursor ?? 0;

	const comments = await db.query.comments.findMany({
		where: (comments, { and, eq, isNull }) => and(eq(comments.postId, input.postId), isNull(comments.deletedAt)),
		with: { author: true },
		orderBy: (comments, { asc }) => asc(comments.createdAt),
		limit: limit + 1,
		offset: cursor,
	});

	const hasMore = comments.length > limit;
	const results = hasMore ? comments.slice(0, -1) : comments;

	if (results.length === 0) {
		return {
			comments: [],
			nextCursor: hasMore ? cursor + limit : null,
		};
	}

	const commentIds = results.map((c) => c.id);

	const [voteRows, bookmarkRows] = await Promise.all([
		db
			.select({ targetId: schema.votes.targetId, score: sql<number>`coalesce(sum(${schema.votes.value}), 0)` })
			.from(schema.votes)
			.where(and(inArray(schema.votes.targetId, commentIds), eq(schema.votes.targetType, "comment")))
			.groupBy(schema.votes.targetId),
		db
			.select({ targetId: schema.bookmarks.targetId, count: count(schema.bookmarks.id) })
			.from(schema.bookmarks)
			.where(and(inArray(schema.bookmarks.targetId, commentIds), eq(schema.bookmarks.targetType, "comment")))
			.groupBy(schema.bookmarks.targetId),
	]);

	const scoreMap = new Map(voteRows.map((v) => [v.targetId, v.score]));
	const bookmarkCountMap = new Map(bookmarkRows.map((b) => [b.targetId, b.count]));

	const commentsWithCounts = results.map((comment) => ({
		id: comment.id,
		content: comment.content,
		authorId: comment.authorId,
		authorName: comment.author.name,
		postId: comment.postId,
		parentCommentId: comment.parentCommentId,
		depth: Number(comment.depth),
		createdAt: comment.createdAt.getTime(),
		score: scoreMap.get(comment.id) ?? 0,
		userVote: 0,
		bookmarkCount: bookmarkCountMap.get(comment.id) ?? 0,
		replies: [],
	}));

	return {
		comments: commentsWithCounts,
		nextCursor: hasMore ? cursor + limit : null,
	};
});

export const updateComment = authed.comment.update.handler(async ({ input, context }) => {
	const comment = await db.query.comments.findFirst({
		where: (comments, { eq }) => eq(comments.id, input.id),
	});

	if (!comment) {
		throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
	}

	if (comment.authorId !== context.user.id) {
		throw new ORPCError("FORBIDDEN", { message: "Not authorized" });
	}

	const embedding = await generateEmbedding(input.content);

	await db.update(schema.comments).set({ content: input.content, embedding }).where(eq(schema.comments.id, input.id));

	const updated = await db.query.comments.findFirst({
		where: (comments, { eq }) => eq(comments.id, input.id),
	});

	if (!updated) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to update comment" });
	}

	return {
		id: updated.id,
		content: updated.content,
		updatedAt: updated.updatedAt.getTime(),
	};
});

export const deleteComment = authed.comment.delete.handler(async ({ input, context }) => {
	const comment = await db.query.comments.findFirst({
		where: (comments, { eq }) => eq(comments.id, input.id),
	});

	if (!comment) {
		throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
	}

	if (comment.authorId !== context.user.id) {
		throw new ORPCError("FORBIDDEN", { message: "Not authorized" });
	}

	await db.update(schema.comments).set({ deletedAt: new Date() }).where(eq(schema.comments.id, input.id));

	return { success: true };
});

export const voteComment = authed.comment.vote.handler(async ({ input, context }) => {
	const existing = await db
		.select()
		.from(schema.votes)
		.where(and(eq(schema.votes.targetId, input.commentId), eq(schema.votes.targetType, "comment"), eq(schema.votes.userId, context.user.id)))
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
			targetId: input.commentId,
			targetType: "comment",
			value: input.value,
		});
	}

	const votes = await db
		.select({ value: sql<number>`sum(${schema.votes.value})` })
		.from(schema.votes)
		.where(eq(schema.votes.targetId, input.commentId));

	return {
		commentId: input.commentId,
		newScore: Number(votes[0]?.value) || 0,
		userVote: input.value,
	};
});

export const commentRouter = {
	create: createComment,
	list: listComment,
	update: updateComment,
	delete: deleteComment,
	vote: voteComment,
};
