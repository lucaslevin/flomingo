import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { formatTimeAgo } from "@/lib/format";
import { VoteButton } from "./vote-button";

interface PostCardProps {
	post: {
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
	};
	attachments?: Array<{
		id: string;
		type: string;
		url: string;
		thumbnailUrl?: string | null;
		order: number;
	}>;
}

const StyledIonicons = withUniwind(Ionicons);

export function PostCard({ post, attachments }: PostCardProps) {
	const router = useRouter();
	const timeAgo = formatTimeAgo(post.createdAt);

	const imageAttachments = attachments?.filter((a) => a.type === "image" || a.type === "gif") ?? [];
	const size = imageAttachments.length === 1 ? 240 : 140;

	return (
		<Pressable onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} className="px-4 py-2 gap-3">
			<Text className="text-xs text-muted">
				c/{post.communitySlug} · {timeAgo}
			</Text>

			<Text className="text-sm text-foreground font-medium leading-snug">{post.title}</Text>

			{imageAttachments.length > 0 && (
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4" className="-mx-4">
					{imageAttachments.map((attachment) => (
						<View key={attachment.id} className="relative rounded-[12px] overflow-hidden">
							<Image source={{ uri: attachment.thumbnailUrl || attachment.url }} style={{ width: size, height: size }} contentFit="cover" transition={200} />
							{attachment.type === "gif" && (
								<View className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded">
									<Text className="text-[10px] text-white font-medium">GIF</Text>
								</View>
							)}
						</View>
					))}
				</ScrollView>
			)}

			<View className="flex-row items-center justify-between">
				<View className="flex-row items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
							router.push({ pathname: "/post/[id]", params: { id: post.id } });
						}}
					>
						<StyledIonicons name="chatbubble" size={16} className="text-muted" />
						<Text className="text-xs text-muted">{post.commentCount}</Text>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
						}}
					>
						<StyledIonicons name="bookmark" size={16} className="text-muted" />
						<Text className="text-xs text-muted">{post.bookmarkCount}</Text>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
							Share.share({
								message: `Check out this post: ${post.title}`,
							});
						}}
					>
						<StyledIonicons name="share" size={16} className="text-muted" />
					</Button>
				</View>

				<View className="ml-12" onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
					<VoteButton postId={post.id} score={post.score} userVote={post.userVote ?? 0} />
				</View>
			</View>
		</Pressable>
	);
}
