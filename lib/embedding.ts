/**
 * Embedding Service — Provider-Agnostic Vector Generation
 * 
 * Current: Local MiniLM-L6-v2 via @xenova/transformers (384-dim, free, no API key)
 * Upgrade Path: Swap provider to 'openai' and set OPENAI_API_KEY for production-grade embeddings
 * 
 * Design: Strategy pattern — change EMBEDDING_PROVIDER to switch implementations
 */

import { pipeline } from '@xenova/transformers';

// --- Configuration ---
// Change this to 'openai' when ready to upgrade
const EMBEDDING_PROVIDER: 'local' | 'openai' = 'local';
const LOCAL_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIM = 384; // MiniLM-L6-v2 output dimension

// --- Singleton Pattern (prevents model reload per request in serverless) ---
let extractor: any = null;
let modelLoading: Promise<any> | null = null;

async function getExtractor() {
  if (extractor) return extractor;
  
  // Prevent concurrent model loads
  if (modelLoading) return modelLoading;
  
  modelLoading = pipeline('feature-extraction', LOCAL_MODEL).then((model) => {
    extractor = model;
    modelLoading = null;
    return model;
  });
  
  return modelLoading;
}

/**
 * Generate embedding vector for a text string.
 * Returns a normalized float array of dimension EMBEDDING_DIM.
 * 
 * @throws Error if embedding generation fails after retries
 */
export async function getEmbedding(text: string, retries = 2): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text');
  }

  // Clean input: collapse whitespace, trim, lowercase for consistency
  const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (EMBEDDING_PROVIDER === 'openai') {
        return await getOpenAIEmbedding(cleanText);
      }
      return await getLocalEmbedding(cleanText);
    } catch (error) {
      if (attempt === retries) {
        console.error(`[Embedding] Failed after ${retries + 1} attempts:`, error);
        throw error;
      }
      console.warn(`[Embedding] Attempt ${attempt + 1} failed, retrying...`);
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw new Error('Embedding generation failed');
}

/**
 * Batch embedding — generates vectors for multiple texts efficiently.
 * Used during database seeding.
 */
export async function getBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  
  for (const text of texts) {
    const embedding = await getEmbedding(text);
    results.push(embedding);
  }
  
  return results;
}

/**
 * Validate that an embedding has the correct dimensions.
 */
export function validateEmbedding(embedding: number[]): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIM &&
    embedding.every(v => typeof v === 'number' && !isNaN(v))
  );
}

// --- Provider Implementations ---

async function getLocalEmbedding(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text, { pooling: 'mean', normalize: true });
  
  const embedding = Array.from(output.data) as number[];
  
  if (!validateEmbedding(embedding)) {
    throw new Error(`Invalid embedding: expected ${EMBEDDING_DIM}-dim, got ${embedding.length}-dim`);
  }
  
  return embedding;
}

/**
 * OpenAI embedding stub — swap to this for production-grade embeddings.
 * Requires OPENAI_API_KEY env variable.
 * Upgrade: Change EMBEDDING_PROVIDER to 'openai' and EMBEDDING_DIM to 1536.
 */
async function getOpenAIEmbedding(text: string): Promise<number[]> {
  // --- UPGRADE PATH ---
  // Uncomment when ready:
  //
  // const response = await fetch('https://api.openai.com/v1/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: 'text-embedding-3-small',
  //     input: text,
  //   }),
  // });
  // const data = await response.json();
  // return data.data[0].embedding;
  
  throw new Error(
    'OpenAI embeddings not configured. Set OPENAI_API_KEY and uncomment the implementation in lib/embedding.ts'
  );
}

// --- Exported Constants ---
export { EMBEDDING_DIM, EMBEDDING_PROVIDER };