import { openrouter } from "@openrouter/ai-sdk-provider";
import { embed } from "ai";

const EMBEDDING_MODEL = "openai/text-embedding-3-small";

export async function generateEmbedding(text: string): Promise<number[]> {
	const normalized = text.replaceAll(/\s+/g, " ").trim();

	if (!normalized) {
		return [];
	}

	const { embedding } = await embed({
		model: openrouter.textEmbeddingModel(EMBEDDING_MODEL),
		value: normalized,
	});

	return embedding;
}

export async function generatePostEmbedding(title: string, content: string): Promise<number[]> {
	return generateEmbedding(`${title}\n\n${content}`);
}
