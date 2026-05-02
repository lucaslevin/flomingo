import Ionicons from "@expo/vector-icons/Ionicons";
import type { LegendListRenderItemProps } from "@legendapp/list";
import { LegendList } from "@legendapp/list";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Menu, ScrollShadow, Separator, Spinner, TextArea, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { CommentCard } from "@/components/comment/comment-card";
import { MediaAttachment } from "@/components/post/media-attachment";
import { VoteButton } from "@/components/post/vote-button";
import { Avatar } from "@/components/ui/avatar";
import { useComments } from "@/hooks/use-comments";
import { usePost } from "@/hooks/use-post";
import { authClient } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/format";
import { orpcClient } from "@/lib/orpc-client";

const StyledIonicons = withUniwind(Ionicons);

function PostHeader({
	post,
	commentCount,
	authorId,
	sessionUserId,
	onMenuAction,
}: {
	post: NonNullable<ReturnType<typeof usePost>["post"]>;
	commentCount: number;
	authorId: string;
	sessionUserId?: string;
	onMenuAction?: (action: string) => void;
}) {
	const timeAgo = formatTimeAgo(post.createdAt);
	const [menuOpen, setMenuOpen] = useState(false);
	const isAuthor = sessionUserId === authorId;

	return (
		<View className="px-4 pt-4 pb-3">
			<View className="flex-row items-center justify-between mb-3">
				<View className="flex-row items-center gap-1">
					<Text className="text-xs text-muted font-semibold">c/{post.communitySlug}</Text>
					<Text className="text-xs text-muted">· {timeAgo}</Text>
				</View>

				<Menu isOpen={menuOpen} onOpenChange={setMenuOpen} presentation="popover">
					<Menu.Trigger asChild>
						<Button isIconOnly variant="ghost" size="sm">
							<StyledIonicons name="ellipsis-horizontal" size={20} className="text-muted" />
						</Button>
					</Menu.Trigger>

					<Menu.Portal>
						<Menu.Overlay />
						<Menu.Content presentation="popover" width={250}>
							<Menu.Group
								selectionMode="none"
								onSelectionChange={(keys) => {
									const action = Array.from(keys)[0] as string;
									setMenuOpen(false);
									onMenuAction?.(action);
								}}
							>
								<Menu.Item id="share">
									<StyledIonicons name="share-outline" size={20} className="text-foreground" />
									<Menu.ItemTitle>Share</Menu.ItemTitle>
								</Menu.Item>

								<Menu.Item id="bookmark">
									<StyledIonicons name="bookmark-outline" size={20} className="text-foreground" />
									<Menu.ItemTitle>Bookmark</Menu.ItemTitle>
								</Menu.Item>

								{isAuthor && (
									<Menu.Item id="edit">
										<StyledIonicons name="create-outline" size={20} className="text-foreground" />
										<Menu.ItemTitle>Edit</Menu.ItemTitle>
									</Menu.Item>
								)}

								{isAuthor && (
									<Menu.Item id="delete" variant="danger">
										<StyledIonicons name="trash-outline" size={20} className="text-danger" />
										<Menu.ItemTitle>Delete</Menu.ItemTitle>
									</Menu.Item>
								)}

								<Menu.Item id="report" variant="danger">
									<StyledIonicons name="flag-outline" size={20} className="text-danger" />
									<Menu.ItemTitle>Report</Menu.ItemTitle>
								</Menu.Item>
							</Menu.Group>
						</Menu.Content>
					</Menu.Portal>
				</Menu>
			</View>

			<View className="flex-row items-center gap-2 mb-3">
				<Avatar name={post.authorName} size={28} />
				<Text className="text-sm text-foreground font-medium">{post.authorName}</Text>
			</View>

			<Text className="text-lg font-bold text-foreground leading-snug mb-3">{post.title}</Text>
			<Text className="text-sm text-foreground leading-relaxed">{post.content}</Text>

			{post.attachments && post.attachments.length > 0 && (
				<View className="mt-4">
					<MediaAttachment attachments={post.attachments} />
				</View>
			)}

			<View className="flex-row items-center justify-between mt-4 pt-3 pb-2">
				<Text className="text-sm text-muted">{commentCount} comments</Text>
				<VoteButton postId={post.id} score={post.score} userVote={post.userVote ?? 0} />
			</View>
		</View>
	);
}

function CommentInput({ onSubmit, isSubmitting }: { onSubmit: (text: string) => void; isSubmitting: boolean }) {
	const [text, setText] = useState("");
	const accentForeground = useThemeColor("accent-foreground");

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="px-4 pb-4">
			<View className="bg-surface border-t border-border p-3">
				<TextArea value={text} onChangeText={setText} placeholder="Add a comment..." numberOfLines={3} className="min-h-12 bg-surface-secondary mb-2" />
				<View className="flex-row justify-end">
					<Button
						size="sm"
						variant="primary"
						onPress={() => {
							if (text.trim()) {
								onSubmit(text.trim());
								setText("");
							}
						}}
						isDisabled={!text.trim() || isSubmitting}
					>
						{isSubmitting ? <Spinner color={accentForeground} size="sm" /> : <Button.Label>Post</Button.Label>}
					</Button>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

export default function PostDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { post, isLoading: postLoading, mutate: mutatePost } = usePost(id);
	const { comments, isLoading: commentsLoading, isValidating, hasMore, setSize, mutate: mutateComments } = useComments(id);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { data } = authClient.useSession();
	const session = data?.session;
	const sessionUserId = data?.user?.id;

	const handleMenuAction = async (action: string) => {
		if (!id) return;

		switch (action) {
			case "delete":
				Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: async () => {
							try {
								await orpcClient.post.delete({ id });
								router.back();
							} catch {
								Alert.alert("Error", "Failed to delete post");
							}
						},
					},
				]);
				break;
			case "share":
				// TODO: implement share
				break;
			case "bookmark":
				// TODO: implement bookmark
				break;
			case "edit":
				// TODO: implement edit
				break;
			case "report":
				// TODO: implement report
				break;
		}
	};

	const handleCommentSubmit = async (content: string) => {
		if (!session) {
			router.push("/sign-in");
			return;
		}

		if (!content.trim() || !id) return;

		setIsSubmitting(true);
		try {
			await orpcClient.comment.create({ postId: id, parentCommentId: null, content: content.trim() });
			mutateComments();
			mutatePost();
		} catch {
			Alert.alert("Error", "Failed to post comment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (postLoading || !post) {
		return (
			<View className="flex-1 justify-center items-center bg-background">
				<Spinner size="lg" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<ScrollShadow size={80} LinearGradientComponent={LinearGradient}>
				<LegendList
					contentContainerStyle={{ paddingBottom: 100 }}
					ListHeaderComponent={
						<View>
							<PostHeader post={post} commentCount={comments.length} authorId={post.authorId} sessionUserId={sessionUserId} onMenuAction={handleMenuAction} />
							<Separator className="mx-4 mb-3" />
						</View>
					}
					data={comments}
					keyExtractor={(item) => item.id}
					renderItem={({ item, index }: LegendListRenderItemProps<(typeof comments)[0]>) => (
						<View className={index % 2 === 0 ? "bg-background" : "bg-surface"}>
							<CommentCard comment={item} />
						</View>
					)}
					ItemSeparatorComponent={() => <View className="h-2" />}
					recycleItems={true}
					onEndReached={hasMore ? () => setSize((s) => s + 1) : undefined}
					onEndReachedThreshold={0.5}
					contentInsetAdjustmentBehavior="automatic"
					ListEmptyComponent={commentsLoading ? <Spinner size="sm" /> : <Text className="text-sm text-muted text-center py-8">No comments yet</Text>}
					ListFooterComponent={
						isValidating && comments.length > 0 ? (
							<View className="py-4">
								<Spinner size="sm" />
							</View>
						) : null
					}
				/>
			</ScrollShadow>

			{session ? (
				<CommentInput onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} />
			) : (
				<View className="absolute bottom-6 px-4 left-0 right-0 z-50">
					<Button onPress={() => router.push("/sign-in")} className="w-full" variant="primary">
						<Button.Label>Sign in to comment</Button.Label>
					</Button>
				</View>
			)}
		</View>
	);
}
