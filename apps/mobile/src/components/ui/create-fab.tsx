import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { authClient } from "@/lib/auth-client";

interface CreateFabProps {
	onCreate?: () => void;
}

export function CreateFab({ onCreate }: CreateFabProps) {
	const { data } = authClient.useSession();
	const session = data?.session;

	const handlePress = () => {
		if (!session) {
			router.push("/sign-in");
			return;
		}
		router.push("/post/new");
		onCreate?.();
	};

	return (
		<Pressable onPress={handlePress} className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center" style={{ borderCurve: "continuous" }}>
			<Ionicons name="add" size={28} color="white" />
		</Pressable>
	);
}
