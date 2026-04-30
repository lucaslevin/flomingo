import useSWRInfinite from "swr/infinite";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

export type FeedType = "foryou" | "following";

export function useFeed(type: FeedType = "foryou") {
	const { data: session } = authClient.useSession();
	const userId = session?.user?.id;

	const getKey = (pageIndex: number, previousPageData: { nextCursor: number | null }) => {
		if (previousPageData && previousPageData.nextCursor === null) return null;
		if (pageIndex === 0) return ["feed", type, userId, 0] as const;
		return ["feed", type, userId, previousPageData.nextCursor] as const;
	};

	const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
		getKey,
		async ([, feedType, userId, cursor]) => {
			const result = await orpcClient.feed.list({
				type: feedType,
				userId,
				limit: 20,
				cursor: cursor ?? 0,
			});
			return result;
		},
		{
			revalidateFirstPage: false,
			revalidateOnFocus: false,
		},
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
