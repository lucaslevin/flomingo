import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { Pressable, Share, Text, View } from "react-native";
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
	const firstImage = imageAttachments[0];

	return (
		<Pressable onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })} className="px-4 py-3 active:bg-surface">
			<View className="gap-3">
				<View className="flex-row items-center gap-1">
					<Text className="text-xs text-muted font-semibold">c/{post.communitySlug}</Text>
					<Text className="text-xs text-muted">· {timeAgo}</Text>
				</View>

				<View className="flex-row gap-3">
					<Text className="flex-1 text-sm text-foreground font-medium leading-snug" numberOfLines={2}>
						{post.title}
					</Text>

					{firstImage && (
						<View className="relative rounded-[8px] overflow-hidden self-start">
							<Image
								source={{ uri: firstImage.thumbnailUrl || firstImage.url }}
								style={{ width: 64, height: 64 }}
								contentFit="cover"
								transition={200}
							/>
							{firstImage.type === "gif" && (
								<View className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded">
									<Text className="text-[10px] text-white font-medium">GIF</Text>
								</View>
							)}
						</View>
					)}
				</View>

				<View className="flex-row items-center">
					<Button
						variant="ghost"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
							router.push({ pathname: "/post/[id]", params: { id: post.id } });
						}}
					>
						<StyledIonicons name="chatbubble" size={16} className="text-muted" />
						<Text className="text-xs text-muted ml-1">{post.commentCount}</Text>
					</Button>

					<Button variant="ghost" size="sm" onPress={(e) => e.stopPropagation()}>
						<StyledIonicons name="bookmark" size={16} className="text-muted" />
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onPress={(e) => {
							e.stopPropagation();
							Share.share({ message: `Check out this post: ${post.title}` });
						}}
					>
						<StyledIonicons name="share" size={16} className="text-muted" />
					</Button>

					<View className="ml-auto" onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
						<VoteButton postId={post.id} score={post.score} userVote={post.userVote ?? 0} />
					</View>
				</View>
			</View>
		</Pressable>
	);
}
