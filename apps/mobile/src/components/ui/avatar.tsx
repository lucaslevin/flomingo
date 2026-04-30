import { avataaarsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { useMemo } from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";

interface AvatarProps {
	name: string;
	size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
	const avatar = useMemo(() => {
		return createAvatar(avataaarsNeutral, {
			seed: name,
			size,
		}).toString();
	}, [name, size]);

	return (
		<View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }}>
			<SvgXml xml={avatar} width={size} height={size} />
		</View>
	);
}
