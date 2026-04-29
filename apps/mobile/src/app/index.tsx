import "../global.css";

import { Button } from "heroui-native";
import { Text, View } from "react-native";

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text>Edit app/index.tsx to edit this screen.</Text>

			<Button>Hello</Button>
		</View>
	);
}
