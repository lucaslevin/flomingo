import sharp from "sharp";

export interface OptimizedImage {
	original: Buffer;
	thumbnail: Buffer;
	mimeType: string;
}

export async function optimizeImage(input: Buffer): Promise<OptimizedImage> {
	const sharpImage = sharp(input);

	const image = sharpImage.clone();

	const metadata = await image.metadata();

	const isAnimated = metadata.pages && metadata.pages > 1;

	if (isAnimated) {
		return {
			original: await sharpImage.clone().gif().toBuffer(),
			thumbnail: await sharpImage.clone().resize(300, null, { withoutEnlargement: true }).gif().toBuffer(),
			mimeType: "image/gif",
		};
	}

	const original = await sharpImage.clone().resize(1200, null, { withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();

	const thumbnail = await sharpImage.clone().resize(300, null, { withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();

	return {
		original,
		thumbnail,
		mimeType: "image/webp",
	};
}

export async function generateThumbnail(input: Buffer, width = 300): Promise<Buffer> {
	return sharp(input).resize(width, null, { withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
}

export async function getImageMetadata(input: Buffer): Promise<{ width: number; height: number; format: string; size: number }> {
	const metadata = await sharp(input).metadata();
	return {
		width: metadata.width || 0,
		height: metadata.height || 0,
		format: metadata.format || "unknown",
		size: input.length,
	};
}
