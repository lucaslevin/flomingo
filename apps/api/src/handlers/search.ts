import { generateEmbedding } from "@flomingo/ai";
import { db, schema } from "@flomingo/db";
import { cosineDistance, desc, inArray, sql } from "drizzle-orm";
import { pub } from "../procedures";

const SIMILARITY_WEIGHT = 0.7;
const POPULARITY_WEIGHT = 0.3;
const DECAY_HALF_LIFE_HOURS = 24 * 7;
const MAX_VOTE_SCORE = 50;
const MAX_COMMENT_COUNT = 20;

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
	voteScore: number;
	commentCount: number;
	combinedScore: number;
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
	voteScore: number;
	combinedScore: number;
};

type SearchResult = PostResult | CommentResult;

function timeDecay(ageInHours: number): number {
	return Math.exp(-(ageInHours / DECAY_HALF_LIFE_HOURS) * Math.LN2);
}

function calculatePopularityScore(voteScore: number, commentCount: number, createdAt: number): number {
	const ageInHours = (Date.now() - createdAt) / (1000 * 60 * 60);
	const decay = timeDecay(ageInHours);

	const normalizedVotes = Math.min(Math.abs(voteScore) / MAX_VOTE_SCORE, 1);
	const normalizedComments = Math.min(commentCount / MAX_COMMENT_COUNT, 1);

	return (normalizedVotes * 0.6 + normalizedComments * 0.4) * decay;
}

function calculateCombinedScore(item: SearchResult): number {
	const voteScore = item.voteScore ?? 0;
	const commentCount = item.type === "post" ? (item.commentCount ?? 0) : 0;

	const popularityScore = calculatePopularityScore(voteScore, commentCount, item.createdAt);

	return SIMILARITY_WEIGHT * item.similarity + POPULARITY_WEIGHT * popularityScore;
}

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
			.orderBy(desc(postsWithSimilarity))
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
				voteScore: 0,
				commentCount: 0,
				combinedScore: 0,
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
			.orderBy(desc(commentsWithSimilarity))
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
				voteScore: 0,
				combinedScore: 0,
			});
		}
	}

	const allResults: SearchResult[] = [...postResults, ...commentResults];

	if (allResults.length > 0) {
		const allIds = allResults.map((r) => r.id);
		const postIds = postResults.map((p) => p.id);

		const [voteRows, commentRows] = await Promise.all([
			db
				.select({ targetId: schema.votes.targetId, score: sql<number>`coalesce(sum(${schema.votes.value}), 0)` })
				.from(schema.votes)
				.where(inArray(schema.votes.targetId, allIds))
				.groupBy(schema.votes.targetId),
			db
				.select({ postId: schema.comments.postId, count: sql<number>`count(*)` })
				.from(schema.comments)
				.where(inArray(schema.comments.postId, postIds))
				.groupBy(schema.comments.postId),
		]);

		const voteScoreMap = new Map(voteRows.map((v) => [v.targetId, Number(v.score) || 0]));
		const commentCountMap = new Map(commentRows.map((c) => [c.postId, Number(c.count) || 0]));

		for (const result of allResults) {
			result.voteScore = voteScoreMap.get(result.id) ?? 0;
			if (result.type === "post") {
				result.commentCount = commentCountMap.get(result.id) ?? 0;
			}
		}
	}

	const results = allResults
		.map((item) => ({
			...item,
			combinedScore: calculateCombinedScore(item),
		}))
		.sort((a, b) => b.combinedScore - a.combinedScore);

	return {
		results: results.slice(0, input.limit) as SearchResult[],
		query: input.query,
	};
});

export const searchRouter = {
	query: searchContent,
};
