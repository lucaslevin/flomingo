import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

export interface Attachment {
	id: string;
	type: "image" | "gif" | "link";
	url: string;
	thumbnailUrl?: string | null;
	order: number;
	ogTitle?: string | null;
	ogDescription?: string | null;
	ogImageUrl?: string | null;
}

interface MediaAttachmentProps {
	attachments: Attachment[];
	onPress?: (attachment: Attachment) => void;
}

function ImageGrid({ attachments, onPress }: { attachments: Attachment[]; onPress?: (a: Attachment) => void }) {
	const size = attachments.length === 1 ? 300 : attachments.length === 2 ? 200 : 160;

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-4" className="-mx-4">
			{attachments.map((attachment) => (
				<Pressable key={attachment.id} onPress={() => onPress?.(attachment)}>
					<View className="relative rounded-xl overflow-hidden">
						<Image
							source={{ uri: attachment.thumbnailUrl || attachment.url }}
							style={{ width: size, height: size }}
							contentFit="cover"
							transition={200}
							accessibilityLabel={attachment.type === "gif" ? "Animated GIF" : "Post image"}
						/>
						{attachment.type === "gif" && (
							<View className="absolute bottom-1 right-1 bg-black/60 px-1 py-0.5 rounded">
								<Text className="text-[10px] text-white font-medium">GIF</Text>
							</View>
						)}
					</View>
				</Pressable>
			))}
		</ScrollView>
	);
}

function LinkPreviewItem({ attachment }: { attachment: Attachment }) {
	if (!attachment.ogTitle) return null;

	return (
		<TouchableOpacity activeOpacity={0.7} onPress={() => WebBrowser.openBrowserAsync(attachment.url)}>
			<View className="bg-surface-secondary rounded-xl flex-row gap-3 p-3">
				{attachment.ogImageUrl && (
					<Image
						source={{ uri: attachment.ogImageUrl }}
						style={{ width: 80, height: 80, borderRadius: 8 }}
						contentFit="cover"
						accessibilityLabel={`Preview image for ${attachment.ogTitle}`}
					/>
				)}
				<View className="flex-1 justify-center">
					<Text className="text-sm font-medium text-foreground leading-tight" numberOfLines={2}>
						{attachment.ogTitle}
					</Text>
					{attachment.ogDescription && (
						<Text className="text-xs text-muted leading-tight" numberOfLines={2}>
							{attachment.ogDescription}
						</Text>
					)}
					<Text className="text-[10px] text-muted/60 mt-1">{new URL(attachment.url).hostname}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
}

export function MediaAttachment({ attachments, onPress }: MediaAttachmentProps) {
	if (!attachments.length) return null;

	const sorted = [...attachments].sort((a, b) => a.order - b.order);
	const images = sorted.filter((a) => a.type === "image" || a.type === "gif");
	const links = sorted.filter((a) => a.type === "link");

	return (
		<View className="gap-2">
			{images.length > 0 && <ImageGrid attachments={images} onPress={onPress} />}
			{links.map((attachment) => (
				<LinkPreviewItem key={attachment.id} attachment={attachment} />
			))}
		</View>
	);
}
