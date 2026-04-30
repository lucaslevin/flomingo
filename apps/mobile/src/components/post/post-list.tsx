import type { LegendListRenderItemProps } from "@legendapp/list";
import { LegendList } from "@legendapp/list";
import { Separator, Spinner, Tabs } from "heroui-native";
import { RefreshControl, Text, View } from "react-native";
import type { FeedType } from "@/hooks/use-feed";
import { authClient } from "@/lib/auth-client";
import { PostCard } from "./post-card";

interface Post {
	id: string;
	title: string;
	authorId: string;
	authorName: string;
	communityId: string;
	communitySlug: string;
	createdAt: number;
	score: number;
	commentCount: number;
	bookmarkCount: number;
	attachmentCount: number;
	userVote?: number;
	attachments?: Array<{
		id: string;
		type: string;
		url: string;
		thumbnailUrl?: string | null;
		order: number;
	}>;
}

interface PostListProps {
	posts: Post[];
	isLoading: boolean;
	isValidating: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	onRefresh: () => void;
	feedType?: FeedType;
	onFeedTypeChange?: (type: FeedType) => void;
}

function EmptyState() {
	return (
		<View className="flex-1 justify-center items-center py-8">
			<Text className="text-foreground-400">No posts yet</Text>
		</View>
	);
}
export function PostList({ posts, isLoading, isValidating, hasMore, onLoadMore, onRefresh, feedType = "foryou", onFeedTypeChange }: PostListProps) {
	const { data: session } = authClient.useSession();
	const isSignedIn = !!session?.user;

	const handleFeedChange = (value: string) => {
		if (value === "following" && !isSignedIn) {
			return;
		}
		onFeedTypeChange?.(value as FeedType);
	};

	if (isLoading && posts.length === 0) {
		return (
			<View className="flex-1 justify-center items-center py-8">
				<Spinner size="lg" />
			</View>
		);
	}

	return (
		<LegendList
			data={posts}
			keyExtractor={(item) => item.id}
			renderItem={({ item }: LegendListRenderItemProps<Post>) => <PostCard post={item} attachments={item.attachments} />}
			recycleItems={true}
			contentInsetAdjustmentBehavior="automatic"
			maintainVisibleContentPosition
			onEndReached={hasMore ? onLoadMore : undefined}
			onEndReachedThreshold={0.5}
			refreshControl={<RefreshControl refreshing={isValidating && posts.length > 0} onRefresh={onRefresh} />}
			ItemSeparatorComponent={() => <Separator />}
			ListHeaderComponent={() => (
				<Tabs value={feedType} onValueChange={handleFeedChange} className="p-2">
					<Tabs.List className="self-center">
						<Tabs.Indicator />
						<Tabs.Trigger value="foryou">
							<Tabs.Label>For You</Tabs.Label>
						</Tabs.Trigger>
						<Tabs.Trigger value="following">
							<Tabs.Label>Following</Tabs.Label>
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs>
			)}
			ListEmptyComponent={<EmptyState />}
			ListFooterComponent={
				isValidating && posts.length > 0 ? (
					<View className="py-4">
						<Spinner size="sm" />
					</View>
				) : null
			}
		/>
	);
}
