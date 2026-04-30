import { PostList } from "@/components/post/post-list";
import { usePosts } from "@/hooks/use-posts.hook";

export default function HomeFeed() {
	const { posts, isLoading, isValidating, hasMore, setSize, mutate } = usePosts();

	return (
		<PostList
			posts={posts as Parameters<typeof PostList>[0]["posts"]}
			isLoading={isLoading}
			isValidating={isValidating}
			hasMore={hasMore}
			onLoadMore={() => setSize((s) => s + 1)}
			onRefresh={() => mutate()}
		/>
	);
}
