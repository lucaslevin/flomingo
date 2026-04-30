import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function FeedLayout() {
	return (
		<Stack
			screenOptions={{
				headerTransparent: true,
				headerRight: () => (
					<TouchableOpacity onPress={() => router.push("/post/new")}>
						<StyledIonicons name="add" size={28} className="text-foreground" />
					</TouchableOpacity>
				),
			}}
		/>
	);
}
