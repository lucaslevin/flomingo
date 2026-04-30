export interface PostItem {
	id: string;
	title: string;
	authorId: string;
	authorName: string;
	communityId: string;
	communitySlug: string;
	createdAt: number;
	score: number;
	commentCount: number;
	bookmarkCount: number;
	userVote?: number;
}

export interface SearchResultItem {
	type: "post" | "comment";
	id: string;
	content: string;
	authorId: string;
	authorName: string;
	createdAt: number;
	similarity?: number;
	title?: string;
	communityId?: string;
	communitySlug?: string;
}

export interface BookmarkItem {
	type: "post" | "comment";
	id: string;
	targetId: string;
	content?: string;
	title?: string;
	authorId: string;
	authorName: string;
	communityId?: string;
	communitySlug?: string;
	postId?: string;
	createdAt: number;
	bookmarkedAt: number;
}

export interface CommentReplyItem {
	id: string;
	content: string;
	authorId: string;
	authorName: string;
	depth: number;
	createdAt: number;
	score: number;
	userVote: number;
	bookmarkCount: number;
}

export interface CommentItem {
	id: string;
	content: string;
	authorId: string;
	authorName: string;
	postId: string;
	parentCommentId: string | null;
	depth: number;
	createdAt: number;
	score: number;
	userVote: number;
	bookmarkCount: number;
	replies?: CommentReplyItem[];
}