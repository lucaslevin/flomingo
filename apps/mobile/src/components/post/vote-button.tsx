import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Button } from "heroui-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { withUniwind } from "uniwind";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

interface VoteButtonProps {
	postId?: string;
	commentId?: string;
	score: number;
	userVote: number;
	onVote?: () => void;
}

const StyledIonicons = withUniwind(Ionicons);

export function VoteButton({ postId, commentId, score, userVote, onVote }: VoteButtonProps) {
	const [optimisticScore, setOptimisticScore] = useState(score);
	const [optimisticVote, setOptimisticVote] = useState(userVote);
	const [isVoting, setIsVoting] = useState(false);
	const { data } = authClient.useSession();
	const session = data?.session;

	const handleVote = async (value: 1 | -1 | 0) => {
		if (!session) {
			router.push("/sign-in");
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

	return (
		<View className="flex-row items-center gap-0">
			<Button isIconOnly variant="ghost" size="sm" onPress={() => handleVote(1)} className="min-w-8 min-h-8">
				<StyledIonicons name="arrow-up-circle" size={22} className={optimisticVote === 1 ? "text-accent" : "text-muted"} />
			</Button>

			<Text
				className={`text-xs font-semibold min-w-5 text-center ${optimisticVote === 1 ? "text-accent" : optimisticVote === -1 ? "text-danger" : "text-foreground"}`}
				style={{ fontVariant: ["tabular-nums"] }}
			>
				{optimisticScore}
			</Text>

			<Button isIconOnly variant="ghost" size="sm" onPress={() => handleVote(-1)} className="min-w-8 min-h-8">
				<StyledIonicons name="arrow-down-circle" size={22} className={optimisticVote === -1 ? "text-danger" : "text-muted"} />
			</Button>
		</View>
	);
}
