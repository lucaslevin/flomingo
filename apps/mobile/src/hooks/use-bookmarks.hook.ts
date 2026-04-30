import useSWRInfinite from "swr/infinite";
import { orpcClient } from "@/lib/orpc-client";
import type { BookmarkItem } from "@/types/api";

export function useBookmarks() {
	const getKey = (pageIndex: number, previousPageData: { nextCursor: number | null }) => {
		if (previousPageData && previousPageData.nextCursor === null) return null;
		return ["bookmarks", pageIndex] as const;
	};

	const { data, error, isLoading, isValidating, size, setSize, mutate } = useSWRInfinite(
		getKey,
		async ([, cursor]) => {
			const result = await orpcClient.bookmark.list({
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

	const bookmarks = (data?.flatMap((page) => page.bookmarks) ?? []) as BookmarkItem[];
	const nextCursor = data?.[data.length - 1]?.nextCursor;
	const hasMore = nextCursor !== null;

	return {
		bookmarks,
		isLoading,
		isValidating,
		error,
		size,
		setSize,
		mutate,
		hasMore,
	};
}