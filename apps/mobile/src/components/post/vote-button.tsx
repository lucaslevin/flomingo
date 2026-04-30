import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

interface VoteButtonProps {
	postId?: string;
	commentId?: string;
	score: number;
	userVote: number;
	onVote?: () => void;
}

export function VoteButton({ postId, commentId, score, userVote, onVote }: VoteButtonProps) {
	const [optimisticScore, setOptimisticScore] = useState(score);
	const [optimisticVote, setOptimisticVote] = useState(userVote);
	const [isVoting, setIsVoting] = useState(false);
	const { data } = authClient.useSession();
	const session = data?.session;

	const handleVote = async (value: 1 | -1 | 0) => {
		if (!session) {
			router.push("/auth-prompt");
			return;
		}
		if (isVoting) return;
		setIsVoting(true);

		const previousScore = optimisticScore;
		const previousVote = optimisticVote;

		const newValue = optimisticVote === value ? 0 : value;
		const scoreDelta = newValue - optimisticVote;
		setOptimisticScore((s) => s + scoreDelta);
		setOptimisticVote(newValue);

		try {
			if (postId) {
				await orpcClient.post.vote({ postId, value: newValue });
			} else if (commentId) {
				await orpcClient.comment.vote({ commentId, value: newValue });
			}
			onVote?.();
		} catch {
			setOptimisticScore(previousScore);
			setOptimisticVote(previousVote);
		} finally {
			setIsVoting(false);
		}
	};

	const upvoteColor = optimisticVote === 1 ? "#ff4500" : "#878a8c";
	const downvoteColor = optimisticVote === -1 ? "#7193ff" : "#878a8c";

	return (
		<View className="flex-row items-center gap-1">
			<Pressable onPress={() => handleVote(1)} className="p-1">
				<Ionicons name="arrow-up-circle" size={20} color={upvoteColor} />
			</Pressable>
			<Text className="text-xs font-semibold min-w-8 text-center" style={{ color: upvoteColor }}>
				{optimisticScore}
			</Text>
			<Pressable onPress={() => handleVote(-1)} className="p-1">
				<Ionicons name="arrow-down-circle" size={20} color={downvoteColor} />
			</Pressable>
		</View>
	);
}