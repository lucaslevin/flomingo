import { openrouter } from "@openrouter/ai-sdk-provider";
import { embed } from "ai";
import { ollama } from "ai-sdk-ollama";

const USE_LOCAL_EMBEDDING = process.env.USE_LOCAL_EMBEDDING === "true";

interface CacheEntry {
	embedding: number[];
	timestamp: number;
}

const embeddingCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;

function getCacheKey(text: string): string {
	return text.toLowerCase().trim();
}

function cleanExpiredEntries(): void {
	const now = Date.now();
	for (const [key, entry] of embeddingCache.entries()) {
		if (now - entry.timestamp > CACHE_TTL_MS) {
			embeddingCache.delete(key);
		}
	}
	if (embeddingCache.size > MAX_CACHE_SIZE) {
		const oldestKeys = [...embeddingCache.entries()]
			.sort((a, b) => a[1].timestamp - b[1].timestamp)
			.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2))
			.map(([key]) => key);
		for (const key of oldestKeys) {
			embeddingCache.delete(key);
		}
	}
}

async function doGenerateEmbedding(text: string): Promise<number[]> {
	if (USE_LOCAL_EMBEDDING) {
		const { embedding } = await embed({
			model: ollama.embeddingModel("mxbai-embed-large"),
			value: text,
		});
		return embedding;
	}

	const { embedding } = await embed({
		model: openrouter.textEmbeddingModel("openai/text-embedding-3-small"),
		value: text,
	});

	return embedding;
}

export async function generateEmbedding(text: string): Promise<number[]> {
	const normalized = text.replaceAll(/\s+/g, " ").trim();

	if (!normalized) {
		return [];
	}

	const cacheKey = getCacheKey(normalized);
	const cached = embeddingCache.get(cacheKey);

	if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
		return cached.embedding;
	}

	cleanExpiredEntries();

	const embedding = await doGenerateEmbedding(normalized);

	embeddingCache.set(cacheKey, {
		embedding,
		timestamp: Date.now(),
	});

	return embedding;
}

export async function generatePostEmbedding(title: string, content: string): Promise<number[]> {
	return generateEmbedding(`${title}\n\n${content}`);
}
