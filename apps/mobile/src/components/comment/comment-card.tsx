import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { VoteButton } from "@/components/post/vote-button";

interface CommentCardProps {
	comment: {
		id: string;
		content: string;
		authorId: string;
		authorName: string;
		postId: string;
		parentCommentId: string | null;
		depth: number;
		createdAt: number;
		score: number;
		userVote: number;
		bookmarkCount: number;
		replies?: Array<{
			id: string;
			content: string;
			authorId: string;
			authorName: string;
			depth: number;
			createdAt: number;
			score: number;
			userVote: number;
			bookmarkCount: number;
		}>;
	};
	onReply?: (commentId: string) => void;
}

export function CommentCard({ comment, onReply }: CommentCardProps) {
	const timeAgo = formatTimeAgo(comment.createdAt);
	const depth = Math.min(comment.depth, 4);
	const indentWidth = depth * 12;

	return (
		<View
			className="bg-content1 rounded-lg p-3"
			style={{
				borderCurve: "continuous",
				marginLeft: indentWidth,
				borderLeftWidth: depth > 0 ? 2 : 0,
				borderLeftColor: depth > 0 ? "#343536" : "transparent",
			}}
		>
			<View className="flex-row items-center gap-2 mb-2">
				<Pressable className="flex-row items-center gap-1">
					<Ionicons name="person-circle-outline" size={16} color="#878a8c" />
					<Text className="text-xs text-foreground-500 font-medium">{comment.authorName}</Text>
				</Pressable>
				<Text className="text-xs text-foreground-400">•</Text>
				<Text className="text-xs text-foreground-400">{timeAgo}</Text>
			</View>

			<Text className="text-sm leading-relaxed mb-2">{comment.content}</Text>

			<View className="flex-row items-center gap-3">
				<VoteButton commentId={comment.id} score={comment.score} userVote={comment.userVote} />
				<Pressable className="flex-row items-center gap-1" onPress={() => onReply?.(comment.id)}>
					<Ionicons name="arrow-undo" size={16} color="#878a8c" />
					<Text className="text-xs text-foreground-500">Reply</Text>
				</Pressable>
				<Pressable className="flex-row items-center gap-1">
					<Ionicons name="bookmark-outline" size={16} color="#878a8c" />
					<Text className="text-xs text-foreground-500">{comment.bookmarkCount}</Text>
				</Pressable>
			</View>

			{comment.replies && comment.replies.length > 0 && (
				<View className="mt-3 gap-2">
					{comment.replies.map((reply) => (
						<CommentCard key={reply.id} comment={reply as CommentCardProps["comment"]} />
					))}
				</View>
			)}
		</View>
	);
}

function formatTimeAgo(timestamp: number): string {
	const seconds = Math.floor(Date.now() / 1000 - timestamp);
	const intervals = [
		{ label: "y", seconds: 31536000 },
		{ label: "mo", seconds: 2592000 },
		{ label: "w", seconds: 604800 },
		{ label: "d", seconds: 86400 },
		{ label: "h", seconds: 3600 },
		{ label: "m", seconds: 60 },
	];
	for (const interval of intervals) {
		const count = Math.floor(seconds / interval.seconds);
		if (count >= 1) return `${count}${interval.label} ago`;
	}
	return "just now";
}
