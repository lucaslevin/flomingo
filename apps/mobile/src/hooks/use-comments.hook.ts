import useSWRInfinite from "swr/infinite";
import { orpcClient } from "@/lib/orpc-client";
import type { CommentItem } from "@/types/api";

export function useComments(postId: string) {
	const getKey = (pageIndex: number, previousPageData: { nextCursor: number | null }) => {
		if (previousPageData && previousPageData.nextCursor === null) return null;
		return ["comments", postId, pageIndex] as const;
	};

	const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
		getKey,
		async ([, , cursor]) => {
			const result = await orpcClient.comment.list({
				postId,
				limit: 20,
				cursor: cursor * 20,
			});
			return result;
		},
		{
			revalidateFirstPage: false,
			revalidateOnFocus: false,
		}
	);

	const comments = (data?.flatMap((page) => page.comments) ?? []) as CommentItem[];
	const nextCursor = data?.[data.length - 1]?.nextCursor;
	const hasMore = nextCursor !== null;

	return {
		comments,
		isLoading,
		isValidating,
		error,
		size,
		setSize,
		mutate,
		hasMore,
	};
}