import { db, schema } from "@flomingo/db";
import { generateEmbedding } from "@flomingo/ai";
import { cosineDistance, desc, sql } from "drizzle-orm";
import { pub } from "../procedures";

type PostResult = {
	type: "post";
	id: string;
	title: string;
	content: string;
	authorId: string;
	authorName: string;
	communityId: string;
	communitySlug: string;
	similarity: number;
	createdAt: number;
};

type CommentResult = {
	type: "comment";
	id: string;
	content: string;
	authorId: string;
	authorName: string;
	postId: string;
	similarity: number;
	createdAt: number;
};

type SearchResult = PostResult | CommentResult;

export const searchContent = pub.search.query.handler(async ({ input }) => {
	const queryEmbedding = await generateEmbedding(input.query);

	if (queryEmbedding.length === 0) {
		return { results: [] as SearchResult[], query: input.query };
	}

	const postResults: PostResult[] = [];
	const commentResults: CommentResult[] = [];

	if (input.type === "all" || input.type === "posts") {
		const postsWithSimilarity = sql<number>`1 - (${cosineDistance(schema.posts.embedding, queryEmbedding)})`;

		const posts = await db
			.select({
				id: schema.posts.id,
				title: schema.posts.title,
				content: schema.posts.content,
				authorId: schema.posts.authorId,
				authorName: schema.users.name,
				communityId: schema.posts.communityId,
				communitySlug: schema.communities.slug,
				similarity: postsWithSimilarity,
				createdAt: schema.posts.createdAt,
			})
			.from(schema.posts)
			.innerJoin(schema.users, sql`${schema.posts.authorId} = ${schema.users.id}`)
			.innerJoin(schema.communities, sql`${schema.posts.communityId} = ${schema.communities.id}`)
			.where(sql`${schema.posts.embedding} IS NOT NULL`)
			.orderBy((t) => desc(t.similarity))
			.limit(input.limit);

		for (const post of posts) {
			postResults.push({
				type: "post",
				id: post.id,
				title: post.title,
				content: post.content,
				authorId: post.authorId,
				authorName: post.authorName,
				communityId: post.communityId,
				communitySlug: post.communitySlug,
				similarity: Number(post.similarity) || 0,
				createdAt: post.createdAt.getTime(),
			});
		}
	}

	if (input.type === "all" || input.type === "comments") {
		const commentsWithSimilarity = sql<number>`1 - (${cosineDistance(schema.comments.embedding, queryEmbedding)})`;

		const comments = await db
			.select({
				id: schema.comments.id,
				content: schema.comments.content,
				authorId: schema.comments.authorId,
				authorName: schema.users.name,
				postId: schema.comments.postId,
				similarity: commentsWithSimilarity,
				createdAt: schema.comments.createdAt,
			})
			.from(schema.comments)
			.innerJoin(schema.users, sql`${schema.comments.authorId} = ${schema.users.id}`)
			.where(sql`${schema.comments.embedding} IS NOT NULL`)
			.orderBy((t) => desc(t.similarity))
			.limit(input.limit);

		for (const comment of comments) {
			commentResults.push({
				type: "comment",
				id: comment.id,
				content: comment.content,
				authorId: comment.authorId,
				authorName: comment.authorName,
				postId: comment.postId,
				similarity: Number(comment.similarity) || 0,
				createdAt: comment.createdAt.getTime(),
			});
		}
	}

	const results: SearchResult[] = [...postResults, ...commentResults].sort((a, b) => b.similarity - a.similarity);

	return {
		results: results.slice(0, input.limit),
		query: input.query,
	};
});

export const searchRouter = {
	query: searchContent,
};
