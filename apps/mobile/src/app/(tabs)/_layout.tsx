import { ThemeProvider } from "@react-navigation/native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";
import { useTheme } from "@/lib/theme";

function ThemedTabLayout() {
	const theme = useTheme();

	return (
		<ThemeProvider value={theme}>
			<NativeTabs
				minimizeBehavior="onScrollDown"
				labelStyle={{ color: DynamicColorIOS({ dark: "white", light: "black" }) }}
				tintColor={DynamicColorIOS({ dark: "white", light: "black" })}
			>
				<NativeTabs.Trigger name="(feed)">
					<NativeTabs.Trigger.Label>Feed</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf={{ default: "flame", selected: "flame.fill" }} md="whatshot" />
				</NativeTabs.Trigger>

				<NativeTabs.Trigger name="clubs">
					<NativeTabs.Trigger.Label>Clubs</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} md="group" />
				</NativeTabs.Trigger>

				<NativeTabs.Trigger name="inbox">
					<NativeTabs.Trigger.Label>Inbox</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf={{ default: "envelope", selected: "envelope.fill" }} md="email" />
				</NativeTabs.Trigger>

				<NativeTabs.Trigger name="search" role="search">
					<NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
					<NativeTabs.Trigger.Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} md="search" />
				</NativeTabs.Trigger>
			</NativeTabs>
		</ThemeProvider>
	);
}

export default ThemedTabLayout;
