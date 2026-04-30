import { Stack } from "expo-router";
import { useState } from "react";
import { PostList } from "@/components/post/post-list";
import { type FeedType, useFeed } from "@/hooks/use-feed";

export default function FeedScreen() {
	const [feedType, setFeedType] = useState<FeedType>("foryou");
	const { posts, isLoading, isValidating, hasMore, setSize, mutate } = useFeed(feedType);

	return (
		<>
			<Stack.Screen.Title>Feed</Stack.Screen.Title>
			<PostList
				posts={posts as Parameters<typeof PostList>[0]["posts"]}
				isLoading={isLoading}
				isValidating={isValidating}
				hasMore={hasMore}
				onLoadMore={() => setSize((s) => s + 1)}
				onRefresh={() => mutate()}
				feedType={feedType}
				onFeedTypeChange={setFeedType}
			/>
		</>
	);
}
