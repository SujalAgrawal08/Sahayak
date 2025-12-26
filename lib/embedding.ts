import { pipeline } from '@xenova/transformers';

// We use a singleton pattern so we don't reload the model on every request
let extractor: any = null;

export async function getEmbedding(text: string) {
  if (!extractor) {
    // Downloads a lightweight BERT model (approx 40MB)
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  // Generate embedding
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  
  // Convert Tensor to simple JavaScript Array
  return Array.from(output.data);
}