import useSWR from "swr";
import { orpcClient } from "@/lib/orpc-client";

export function usePost(id: string) {
	const { data, error, isLoading, isValidating, mutate } = useSWR(
		["post", id] as const,
		() => orpcClient.post.byId({ id }),
		{
			revalidateOnFocus: false,
		}
	);

	return {
		post: data,
		isLoading,
		isValidating,
		error,
		mutate,
	};
}