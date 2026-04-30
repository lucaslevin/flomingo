import useSWRInfinite from "swr/infinite";
import { orpcClient } from "@/lib/orpc-client";

export function useCommunities() {
	const getKey = (pageIndex: number, previousPageData: { nextCursor: number | null }) => {
		if (previousPageData && previousPageData.nextCursor === null) return null;
		return ["communities", pageIndex] as const;
	};

	const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
		getKey,
		async ([, cursor]) => {
			const result = await orpcClient.community.list({
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

	const communities = data?.flatMap((page) => page.communities) ?? [];
	const nextCursor = data?.[data.length - 1]?.nextCursor;
	const hasMore = nextCursor !== null;

	return {
		communities,
		isLoading,
		isValidating,
		error,
		size,
		setSize,
		mutate,
		hasMore,
	};
}