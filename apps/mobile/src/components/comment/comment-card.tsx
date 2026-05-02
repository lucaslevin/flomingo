import Ionicons from "@expo/vector-icons/Ionicons";
import { Accordion, Button } from "heroui-native";
import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { VoteButton } from "@/components/post/vote-button";
import { Avatar } from "@/components/ui/avatar";
import { formatTimeAgo } from "@/lib/format";

const StyledIonicons = withUniwind(Ionicons);

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

function getDepthStyles(depth: number) {
	const clampedDepth = Math.min(depth, 2);

	const indentWidths = [0, 14, 28];

	return {
		indentWidth: indentWidths[clampedDepth],
	};
}

function ActionButton({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
	return (
		<Button isIconOnly variant="ghost" size="sm" onPress={onPress}>
			<StyledIonicons name={icon} size={18} className="text-muted" />
			{label ? <Text className="text-xs text-muted">{label}</Text> : null}
		</Button>
	);
}

function CommentMeta({ authorName, timeAgo }: { authorName: string; timeAgo: string }) {
	return (
		<View className="flex-row items-center gap-2">
			<Pressable className="flex-row items-center gap-2">
				<Avatar name={authorName} size={24} />
				<Text className="text-[11px] text-foreground font-normal">{authorName}</Text>
			</Pressable>
			<Text className="text-[10px] text-muted">·</Text>
			<Text className="text-[10px] text-muted">{timeAgo}</Text>
		</View>
	);
}

function CommentActions({ comment, onReply }: { comment: CommentCardProps["comment"]; onReply?: (commentId: string) => void }) {
	return (
		<View className="flex-row items-center justify-between mt-2">
			<VoteButton commentId={comment.id} score={comment.score} userVote={comment.userVote} />

			<View className="flex-row gap-2 items-center">
				<Button variant="ghost" size="sm" onPress={() => onReply?.(comment.id)}>
					<StyledIonicons name="chatbubble" size={18} className="text-muted" />
					<Text className="text-xs text-muted font-medium">Reply</Text>
				</Button>

				<View>
					<ActionButton icon="bookmark" label={comment.bookmarkCount > 0 ? `${comment.bookmarkCount}` : ""} />
				</View>
			</View>
		</View>
	);
}

function ReplyThread({ comment, onReply }: { comment: CommentCardProps["comment"]; onReply?: (commentId: string) => void }) {
	const { indentWidth } = getDepthStyles(comment.depth);
	const bgClass = comment.depth === 1 ? "bg-surface-secondary/30" : comment.depth === 2 ? "bg-surface-secondary/50" : "";

	return (
		<View className={`${bgClass}`} style={{ marginLeft: indentWidth }}>
			<View className="px-4 py-3">
				<CommentMeta authorName={comment.authorName} timeAgo={formatTimeAgo(comment.createdAt)} />
				<Text className="text-sm text-foreground leading-relaxed mt-1.5">{comment.content}</Text>
				<CommentActions comment={comment} onReply={onReply} />
				{comment.replies && comment.replies.length > 0 && (
					<View className="mt-3 gap-2">
						{comment.replies.map((reply) => (
							<ReplyThread key={reply.id} comment={reply as CommentCardProps["comment"]} onReply={onReply} />
						))}
					</View>
				)}
			</View>
		</View>
	);
}

export function CommentCard({ comment, onReply }: CommentCardProps) {
	const depth = Math.min(comment.depth, 2);
	const { indentWidth } = getDepthStyles(depth);
	const hasReplies = comment.replies && comment.replies.length > 0;

	const cardContent = (
		<View className="px-4 py-3">
			<View className="flex-row items-start gap-3">
				<View className="flex-1">
					<CommentMeta authorName={comment.authorName} timeAgo={formatTimeAgo(comment.createdAt)} />
					<Text className="text-sm text-foreground leading-relaxed mt-1.5">{comment.content}</Text>
					<CommentActions comment={comment} onReply={onReply} />
				</View>
				{hasReplies && <StyledIonicons name="chevron-down" size={18} className="text-muted mt-0.5" />}
			</View>
		</View>
	);

	if (hasReplies) {
		return (
			<View style={{ marginLeft: indentWidth }}>
				<Accordion selectionMode="multiple" defaultValue={[]}>
					<Accordion.Item value={comment.id}>
						<Accordion.Trigger>{cardContent}</Accordion.Trigger>
						<Accordion.Content>
							<View className="gap-3 pt-2">
								{comment.replies?.map((reply) => (
									<ReplyThread key={reply.id} comment={reply as CommentCardProps["comment"]} onReply={onReply} />
								))}
							</View>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion>
			</View>
		);
	}

	return (
		<View style={{ marginLeft: indentWidth }}>
			<View className="px-4 py-3">
				<CommentMeta authorName={comment.authorName} timeAgo={formatTimeAgo(comment.createdAt)} />
				<Text className="text-sm text-foreground leading-relaxed mt-1.5">{comment.content}</Text>
				<CommentActions comment={comment} onReply={onReply} />
			</View>
		</View>
	);
}
