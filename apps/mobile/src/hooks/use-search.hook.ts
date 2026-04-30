import useSWR from "swr";
import { orpcClient } from "@/lib/orpc-client";
import type { SearchResultItem } from "@/types/api";

export function useSearch(query: string) {
	const { data, error, isLoading, isValidating, mutate } = useSWR(
		["search", query] as const,
		async ([, q]) => {
			if (!q || q.trim().length < 2) return null;
			const result = await orpcClient.search.query({
				query: q,
				limit: 20,
			});
			return result;
		},
		{
			revalidateOnFocus: false,
		}
	);

	const results = (data?.results ?? []) as SearchResultItem[];

	return {
		results,
		isLoading,
		isValidating,
		error,
		mutate,
	};
}