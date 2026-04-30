import useSWR from "swr";
import { orpcClient } from "@/lib/orpc-client";

export function useCommunity(slug: string) {
	const { data, error, isLoading, isValidating, mutate } = useSWR(["community", slug] as const, () => orpcClient.community.bySlug({ slug }), {
		revalidateOnFocus: false,
	});

	return {
		community: data,
		isLoading,
		isValidating,
		error,
		mutate,
	};
}
