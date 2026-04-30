import { S3Client } from "bun";
import { nanoid } from "nanoid";

export interface S3Config {
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
	endpoint: string;
}

const s3Clients = new Map<string, S3Client>();

function getS3Client(config?: Partial<S3Config>): S3Client {
	const key = JSON.stringify(config || {});

	let client = s3Clients.get(key);
	if (!client) {
		client = new S3Client({
			accessKeyId: config?.accessKeyId || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "",
			secretAccessKey: config?.secretAccessKey || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "",
			bucket: config?.bucket || process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET || "flomingo-attachments",
			endpoint: config?.endpoint || process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT || "",
		});
		s3Clients.set(key, client);
	}

	return client;
}

export { S3Client };

export function generateS3Key(postId: string, filename: string, type: "image" | "gif"): string {
	const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
	const timestamp = Date.now();
	const id = nanoid(8);
	const folder = type === "gif" ? "gifs" : "images";
	return `${folder}/${postId}/${timestamp}-${id}.${ext}`;
}

export async function uploadToS3(
	key: string,
	data: Uint8Array | Blob | Response,
	options?: {
		contentType?: string;
		publicRead?: boolean;
	},
): Promise<string> {
	const s3 = getS3Client();

	await s3.write(key, data, {
		type: options?.contentType || "application/octet-stream",
		acl: options?.publicRead ? "public-read" : "private",
	});

	const s3file = s3.file(key);
	return s3file.presign({
		expiresIn: 60 * 60 * 24 * 7,
	});
}

export async function uploadOptimizedImage(postId: string, original: Buffer, thumbnail: Buffer, filename: string): Promise<{ url: string; thumbnailUrl: string; s3Key: string }> {
	const s3 = getS3Client();
	const ext = filename.split(".").pop()?.toLowerCase() || "webp";
	const timestamp = Date.now();
	const id = nanoid(8);
	const key = `images/${postId}/${timestamp}-${id}.${ext}`;
	const thumbnailKey = `images/${postId}/${timestamp}-${id}-thumb.webp`;

	const s3file = s3.file(key);
	const thumbFile = s3.file(thumbnailKey);

	await s3file.write(original, { type: "image/webp" });
	await thumbFile.write(thumbnail, { type: "image/webp" });

	return {
		url: s3file.presign({ acl: "public-read", expiresIn: 60 * 60 * 24 * 7 }),
		thumbnailUrl: thumbFile.presign({ acl: "public-read", expiresIn: 60 * 60 * 24 * 7 }),
		s3Key: key,
	};
}

export async function deleteFromS3(key: string): Promise<void> {
	const s3 = getS3Client();
	await s3.delete(key);
}

export function generatePresignedUploadUrl(key: string, expiresInSeconds = 3600): string {
	const s3 = getS3Client();
	const s3file = s3.file(key);
	return s3file.presign({
		method: "PUT",
		expiresIn: expiresInSeconds,
	});
}

export function getPublicUrl(key: string): string {
	const bucket = process.env.S3_BUCKET_NAME || "flomingo-attachments";
	const endpoint = process.env.S3_ENDPOINT || "";
	return `${endpoint}/${bucket}/${key}`;
}
