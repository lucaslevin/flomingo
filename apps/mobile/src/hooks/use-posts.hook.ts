import useSWRInfinite from "swr/infinite";
import { orpcClient } from "@/lib/orpc-client";

export function usePosts(communitySlug?: string) {
	const getKey = (pageIndex: number, previousPageData: { nextCursor: number | null }) => {
		if (previousPageData && previousPageData.nextCursor === null) return null;
		return ["posts", communitySlug, pageIndex] as const;
	};

	const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
		getKey,
		async ([, , cursor]) => {
			const result = await orpcClient.post.list({
				communitySlug,
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

	const posts = data?.flatMap((page) => page.posts) ?? [];
	const nextCursor = data?.[data.length - 1]?.nextCursor;
	const hasMore = nextCursor !== null;

	return {
		posts,
		isLoading,
		isValidating,
		error,
		size,
		setSize,
		mutate,
		hasMore,
	};
}