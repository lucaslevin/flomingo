import Ionicons from "@expo/vector-icons/Ionicons";
import { detectMediaInContent, fetchOpenGraph } from "@flomingo/utils/opengraph";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Button, Description, Dialog, FieldError, Input, Label, Select, Spinner, TextArea, TextField, useThemeColor } from "heroui-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { withUniwind } from "uniwind";
import * as z from "zod";
import { useCommunities } from "@/hooks/use-communities";
import { authClient } from "@/lib/auth-client";
import { orpcClient } from "@/lib/orpc-client";

const StyledIonicons = withUniwind(Ionicons);

interface AttachmentPreview {
	id: string;
	type: "image" | "link";
	url: string;
	thumbnailUrl?: string;
	ogTitle?: string;
	ogDescription?: string;
	ogImageUrl?: string;
}

const schema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().min(1, "Content is required"),
	communityId: z.object({
		value: z.string(),
		label: z.string(),
	}),
});

type FormValues = z.infer<typeof schema>;

export default function CreatePost() {
	const [isLoading, setIsLoading] = useState(false);
	const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
	const [linkDialogOpen, setLinkDialogOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [linkLoading, setLinkLoading] = useState(false);
	const accentForeground = useThemeColor("accent-foreground");

	const { data } = authClient.useSession();
	const session = data?.session;
	const { communities } = useCommunities();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { title: "", content: "", communityId: { value: "", label: "" } },
	});

	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			const asset = result.assets[0];
			const newAttachment: AttachmentPreview = {
				id: `temp-${Date.now()}`,
				type: "image",
				url: asset.uri,
			};
			setAttachments((prev) => [...prev, newAttachment]);
		}
	};

	const handleAddLink = async () => {
		if (!linkUrl.trim()) return;

		setLinkLoading(true);
		try {
			const ogData = await fetchOpenGraph(linkUrl.trim());
			const newAttachment: AttachmentPreview = {
				id: `temp-${Date.now()}`,
				type: "link",
				url: linkUrl.trim(),
				ogTitle: ogData?.title || undefined,
				ogDescription: ogData?.description || undefined,
				ogImageUrl: ogData?.imageUrl || undefined,
			};
			setAttachments((prev) => [...prev, newAttachment]);
			setLinkDialogOpen(false);
			setLinkUrl("");
		} catch {
			Alert.alert("Error", "Failed to fetch link preview");
		} finally {
			setLinkLoading(false);
		}
	};

	const handleRemoveAttachment = (id: string) => {
		setAttachments((prev) => prev.filter((a) => a.id !== id));
	};

	const onSubmit = async (values: FormValues) => {
		if (!session) {
			router.push("/sign-in");
			return;
		}

		setIsLoading(true);
		try {
			const { id: postId } = await orpcClient.post.create({
				title: values.title.trim(),
				content: values.content.trim(),
				communityId: values.communityId.value,
			});

			for (const [index, attachment] of attachments.entries()) {
				if (attachment.type === "image") {
					const filename = attachment.url.split("/").pop() || "image.jpg";
					const { uploadUrl, key, url } = await orpcClient.attachment.presign({
						postId,
						filename,
						contentType: "image/jpeg",
						type: "image",
					});

					const imageResponse = await fetch(attachment.url);
					const imageBlob = await imageResponse.blob();
					await fetch(uploadUrl, {
						method: "PUT",
						body: imageBlob,
						headers: { "Content-Type": "image/jpeg" },
					});

					await orpcClient.attachment.create({
						postId,
						type: "image",
						url,
						s3Key: key,
						order: index,
					});
				} else if (attachment.type === "link") {
					await orpcClient.attachment.create({
						postId,
						type: "link",
						url: attachment.url,
						order: index,
						ogTitle: attachment.ogTitle,
						ogDescription: attachment.ogDescription,
						ogImageUrl: attachment.ogImageUrl,
					});
				}
			}

			const detectedMedia = detectMediaInContent(values.content);
			let attachmentIndex = attachments.length;
			for (const media of detectedMedia) {
				if (media.type === "link") {
					const ogData = await fetchOpenGraph(media.url);
					await orpcClient.attachment.create({
						postId,
						type: "link",
						url: media.url,
						order: attachmentIndex++,
						ogTitle: ogData?.title,
						ogDescription: ogData?.description,
						ogImageUrl: ogData?.imageUrl,
					});
				}
			}

			router.back();
		} catch {
			Alert.alert("Error", "Failed to create post. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<ScrollView contentInsetAdjustmentBehavior="automatic">
				<View className="p-4 gap-4">
					<View className="gap-4">
						<Controller
							control={control}
							name="communityId"
							render={({ field: { onChange, value } }) => (
								<Select value={value ?? undefined} onValueChange={(option) => onChange(option)} presentation="bottom-sheet">
									<Select.Trigger>
										<Select.Value placeholder="Choose community" />
										<Select.TriggerIndicator />
									</Select.Trigger>
									<Select.Portal>
										<Select.Overlay />
										<Select.Content presentation="bottom-sheet" snapPoints={["35%"]}>
											<Select.ListLabel>Choose a community</Select.ListLabel>
											{communities.map((community) => (
												<Select.Item key={community.id} value={community.id} label={`c/${community.slug}`} />
											))}
										</Select.Content>
									</Select.Portal>
								</Select>
							)}
						/>

						<Controller
							control={control}
							name="title"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextField isInvalid={!!errors.title}>
									<Label isInvalid={!!errors.title}>Title</Label>
									<Input value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Post title" autoCapitalize="sentences" />
									<Description>Give your post a descriptive title</Description>
									{errors.title && <FieldError>{errors.title.message}</FieldError>}
								</TextField>
							)}
						/>

						<Controller
							control={control}
							name="content"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextField isInvalid={!!errors.content}>
									<Label isInvalid={!!errors.content}>Content</Label>
									<TextArea value={value} onChangeText={onChange} onBlur={onBlur} placeholder="What's on your mind?" numberOfLines={8} />
									{errors.content && <FieldError>{errors.content.message}</FieldError>}
								</TextField>
							)}
						/>

						<View className="flex-row gap-2">
							<Button variant="tertiary" className="flex-1 justify-between" onPress={handlePickImage}>
								<Button.Label>Add Image</Button.Label>
								<StyledIonicons name="image-outline" size={20} className="text-foreground" />
							</Button>
							<Button variant="tertiary" className="flex-1 justify-between" onPress={() => setLinkDialogOpen(true)}>
								<Button.Label>Add Link</Button.Label>
								<StyledIonicons name="link-outline" size={20} className="text-foreground" />
							</Button>
						</View>

						{attachments.length > 0 && (
							<View className="gap-2">
								<Text className="text-sm text-muted">Attachments</Text>
								{attachments.map((attachment) => (
									<View key={attachment.id} className="flex-row items-center gap-3 bg-surface p-3 rounded-lg">
										{attachment.type === "image" ? (
											<Image source={{ uri: attachment.url }} className="w-12 h-12 rounded" contentFit="cover" />
										) : (
											<View className="w-12 h-12 bg-surface-secondary rounded flex items-center justify-center">
												<StyledIonicons name="link" size={16} className="text-muted" />
											</View>
										)}
										<Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
											{attachment.type === "link" ? attachment.ogTitle || attachment.url : "Image"}
										</Text>
										<TouchableOpacity onPress={() => handleRemoveAttachment(attachment.id)}>
											<StyledIonicons name="close-circle" size={20} className="text-muted" />
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						<Button onPress={handleSubmit(onSubmit)} variant="primary" className="mt-2" isDisabled={isLoading}>
							{isLoading ? <Spinner color={accentForeground} /> : <Button.Label>Post</Button.Label>}
						</Button>
					</View>
				</View>
			</ScrollView>

			<Dialog isOpen={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
				<Dialog.Portal>
					<Dialog.Overlay />
					<Dialog.Content>
						<Dialog.Title>Add Link</Dialog.Title>
						<View className="py-4">
							<Input value={linkUrl} onChangeText={setLinkUrl} placeholder="https://example.com" autoCapitalize="none" keyboardType="url" />
						</View>
						<View className="flex-row justify-end gap-3">
							<Button variant="ghost" onPress={() => setLinkDialogOpen(false)}>
								<Button.Label>Cancel</Button.Label>
							</Button>
							<Button onPress={handleAddLink} isDisabled={!linkUrl.trim() || linkLoading}>
								{linkLoading ? <Spinner size="sm" /> : <Button.Label>Add</Button.Label>}
							</Button>
						</View>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog>
		</>
	);
}
