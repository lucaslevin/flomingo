export interface OpenGraphData {
	title: string;
	description: string;
	imageUrl: string;
}

export async function fetchOpenGraph(url: string): Promise<OpenGraphData | null> {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "Flomingo/1.0 (+https://flomingo.com)",
			},
		});

		if (!response.ok) return null;

		const html = await response.text();

		const getMetaContent = (pattern: RegExp): string => {
			const match = html.match(pattern);
			const content = match?.[1];
			return content ? decodeHTMLEntities(content) : "";
		};

		const ogTitle =
			getMetaContent(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
			getMetaContent(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i) ||
			getMetaContent(/<title[^>]*>([^<]+)<\/title>/i);

		const ogDescription =
			getMetaContent(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) || getMetaContent(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i) || "";

		const ogImage = getMetaContent(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) || getMetaContent(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) || "";

		if (!ogTitle && !ogDescription && !ogImage) {
			return null;
		}

		return {
			title: ogTitle,
			description: ogDescription,
			imageUrl: ogImage,
		};
	} catch {
		return null;
	}
}

function decodeHTMLEntities(text: string): string {
	return text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ");
}

export function isImageUrl(url: string): boolean {
	return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
}

export function isGifUrl(url: string): boolean {
	return /\.gif$/i.test(url);
}

export function extractUrlsFromContent(content: string): string[] {
	const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[[\]]+)/g;
	return content.match(urlRegex) || [];
}

export function detectMediaInContent(content: string): Array<{ url: string; type: "image" | "gif" | "link" }> {
	const urls = extractUrlsFromContent(content);
	return urls.map((url) => {
		if (isGifUrl(url)) return { url, type: "gif" as const };
		if (isImageUrl(url)) return { url, type: "image" as const };
		return { url, type: "link" as const };
	});
}
