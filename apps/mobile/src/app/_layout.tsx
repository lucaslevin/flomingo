import { ThemeProvider } from "@react-navigation/native";
import "../global.css";

import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { withUniwind } from "uniwind";
import { useTheme } from "@/lib/theme";

const StyledIonicons = withUniwind(Ionicons);

export default function RootLayout() {
	const theme = useTheme();

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider value={theme}>
				<HeroUINativeProvider>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="post/[id]" options={{ title: "Post", headerBackTitle: "Back", headerTransparent: true }} />
						<Stack.Screen
							name="post/new"
							options={{
								title: "Composer",
								headerBackTitle: "Cancel",
								presentation: "modal",
								headerRight: () => (
									<TouchableOpacity onPress={() => router.back()}>
										<StyledIonicons name="close" size={22} className="text-foreground" />
									</TouchableOpacity>
								),
							}}
						/>
						<Stack.Screen name="community/new" options={{ title: "Create Community", headerBackTitle: "Cancel", presentation: "modal" }} />
						<Stack.Screen name="(auth)/sign-in" options={{ title: "Sign In", presentation: "modal", headerTransparent: true }} />
					</Stack>
				</HeroUINativeProvider>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}
