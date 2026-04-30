import { NativeTabs } from "expo-router/unstable-native-tabs";
import { DynamicColorIOS } from "react-native";

export default function TabLayout() {
	return (
		<NativeTabs
			minimizeBehavior="onScrollDown"
			labelStyle={{ color: DynamicColorIOS({ dark: "white", light: "black" }) }}
			tintColor={DynamicColorIOS({ dark: "white", light: "black" })}
		>
			<NativeTabs.Trigger name="(home)">
				<NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="profile">
				<NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
			</NativeTabs.Trigger>

			<NativeTabs.Trigger name="search" role="search">
				<NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
				<NativeTabs.Trigger.Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} md="search" />
			</NativeTabs.Trigger>
		</NativeTabs>
	);
}
