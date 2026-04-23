/**
 * Vector Search Engine — Semantic + Hybrid Search
 * 
 * Current: In-app cosine similarity (works for ~100 schemes)
 * Upgrade Path: Replace `searchInApp()` with `searchWithAtlas()` for 10K+ documents
 * 
 * Architecture:
 *   Query → Embed → Compare against cached scheme vectors → Rank → Return Top-K
 */

import { getEmbedding, EMBEDDING_DIM } from './embedding';
import { getSchemeEmbeddingCache } from './cache';

// --- Types ---
export interface SearchResult {
  scheme: any;
  semanticScore: number;
  keywordScore: number;
  combinedScore: number;
  method: 'semantic' | 'keyword' | 'hybrid';
}

export interface SearchOptions {
  topK?: number;
  minScore?: number;
  method?: 'semantic' | 'keyword' | 'hybrid';
  includeKeywordFallback?: boolean;
}

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  topK: 5,
  minScore: 0.15,
  method: 'hybrid',
  includeKeywordFallback: true,
};

// --- Core: Cosine Similarity ---

/**
 * Compute cosine similarity between two vectors.
 * Both vectors must be pre-normalized (which MiniLM output is).
 * Returns value in [-1, 1], where 1 = identical meaning.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`);
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

// --- Semantic Search ---

/**
 * Pure semantic search using embedding similarity.
 * 
 * Flow:
 * 1. Embed the user query
 * 2. Fetch all scheme embeddings (from cache or DB)
 * 3. Compute cosine similarity for each
 * 4. Return top-K results above minimum threshold
 */
export async function semanticSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  // 1. Embed the query
  const queryEmbedding = await getEmbedding(query);
  
  // 2. Get cached scheme embeddings
  const schemes = await getSchemeEmbeddingCache();
  
  if (schemes.length === 0) {
    console.warn('[VectorSearch] No scheme embeddings found in DB. Run seedWithEmbeddings first.');
    return [];
  }
  
  // 3. Compute similarities
  const scored: SearchResult[] = schemes
    .filter(s => s.embedding && s.embedding.length === EMBEDDING_DIM)
    .map(s => ({
      scheme: s.scheme,
      semanticScore: cosineSimilarity(queryEmbedding, s.embedding),
      keywordScore: 0,
      combinedScore: 0,
      method: 'semantic' as const,
    }));
  
  // 4. Sort and filter
  scored.forEach(s => { s.combinedScore = s.semanticScore; });
  scored.sort((a, b) => b.combinedScore - a.combinedScore);
  
  const elapsed = Date.now() - startTime;
  console.log(`[VectorSearch] Semantic search completed in ${elapsed}ms, ${scored.length} candidates`);
  
  return scored
    .filter(s => s.combinedScore >= opts.minScore)
    .slice(0, opts.topK);
}

// --- Keyword Search (Legacy, used as fallback) ---

/**
 * Basic keyword matching score.
 * Counts how many query words appear in the scheme text.
 */
function keywordMatchScore(query: string, schemeText: string): number {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const text = schemeText.toLowerCase();
  
  if (queryWords.length === 0) return 0;
  
  let matches = 0;
  for (const word of queryWords) {
    if (text.includes(word)) matches++;
  }
  
  return matches / queryWords.length;
}

// --- Hybrid Search (Recommended) ---

/**
 * Hybrid search combining semantic similarity with keyword matching.
 * 
 * Formula: combinedScore = α * semanticScore + (1-α) * keywordScore
 * Default α = 0.7 (semantic-heavy)
 * 
 * This is the primary search method used by the API.
 */
export async function hybridSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  const SEMANTIC_WEIGHT = 0.7;
  const KEYWORD_WEIGHT = 0.3;
  
  try {
    // 1. Embed the query
    const queryEmbedding = await getEmbedding(query);
    
    // 2. Get cached scheme embeddings
    const schemes = await getSchemeEmbeddingCache();
    
    if (schemes.length === 0) {
      console.warn('[VectorSearch] No embeddings found — falling back to keyword search');
      return keywordOnlySearch(query, opts);
    }
    
    // 3. Compute hybrid scores
    const scored: SearchResult[] = schemes.map(s => {
      const schemeText = buildSchemeText(s.scheme);
      
      const semanticScore = (s.embedding && s.embedding.length === EMBEDDING_DIM)
        ? cosineSimilarity(queryEmbedding, s.embedding)
        : 0;
      
      const kwScore = keywordMatchScore(query, schemeText);
      
      const combinedScore = (SEMANTIC_WEIGHT * semanticScore) + (KEYWORD_WEIGHT * kwScore);
      
      return {
        scheme: s.scheme,
        semanticScore,
        keywordScore: kwScore,
        combinedScore,
        method: 'hybrid' as const,
      };
    });
    
    // 4. Sort and filter
    scored.sort((a, b) => b.combinedScore - a.combinedScore);
    
    const elapsed = Date.now() - startTime;
    console.log(`[VectorSearch] Hybrid search completed in ${elapsed}ms`);
    
    return scored
      .filter(s => s.combinedScore >= opts.minScore)
      .slice(0, opts.topK);
      
  } catch (error) {
    console.error('[VectorSearch] Hybrid search failed, falling back to keyword:', error);
    
    if (opts.includeKeywordFallback) {
      return keywordOnlySearch(query, opts);
    }
    throw error;
  }
}

/**
 * Keyword-only search fallback — used when embeddings are unavailable.
 */
async function keywordOnlySearch(
  query: string,
  opts: Required<SearchOptions>
): Promise<SearchResult[]> {
  const schemes = await getSchemeEmbeddingCache();
  
  const scored: SearchResult[] = schemes.map(s => {
    const schemeText = buildSchemeText(s.scheme);
    const kwScore = keywordMatchScore(query, schemeText);
    
    return {
      scheme: s.scheme,
      semanticScore: 0,
      keywordScore: kwScore,
      combinedScore: kwScore,
      method: 'keyword' as const,
    };
  });
  
  scored.sort((a, b) => b.combinedScore - a.combinedScore);
  
  return scored
    .filter(s => s.combinedScore > 0)
    .slice(0, opts.topK);
}

// --- Helpers ---

/**
 * Build searchable text from scheme fields for keyword matching.
 */
function buildSchemeText(scheme: any): string {
  const parts = [
    scheme.name || '',
    scheme.description || '',
    scheme.category || '',
    scheme.ministry || '',
    ...(Array.isArray(scheme.rules?.occupation) ? scheme.rules.occupation : []),
    ...(Array.isArray(scheme.rules?.caste) ? scheme.rules.caste : []),
  ];
  return parts.join(' ');
}

/**
 * Build the text used for generating scheme embeddings.
 * This is the canonical representation — used at seed time AND for cache keys.
 */
export function buildEmbeddingText(scheme: any): string {
  const occupations = Array.isArray(scheme.rules?.occupation)
    ? scheme.rules.occupation.join(', ')
    : (Array.isArray(scheme.occupation) ? scheme.occupation.join(', ') : '');
  
  return [
    scheme.name || '',
    scheme.description || '',
    scheme.category || '',
    occupations,
  ].filter(Boolean).join('. ');
}

// --- UPGRADE PATH: MongoDB Atlas Vector Search ---
// 
// When your scheme collection exceeds ~500 documents, switch from in-app
// cosine similarity to Atlas Vector Search:
//
// 1. Create a vector search index on your Atlas cluster:
//    {
//      "fields": [{
//        "type": "vector",
//        "path": "description_embedding",
//        "numDimensions": 384,
//        "similarity": "cosine"
//      }]
//    }
//
// 2. Replace `semanticSearch()` internals with:
//    const results = await Scheme.aggregate([
//      {
//        $vectorSearch: {
//          index: "scheme_vector_index",
//          path: "description_embedding",
//          queryVector: queryEmbedding,
//          numCandidates: 50,
//          limit: topK,
//        }
//      },
//      { $project: { score: { $meta: "vectorSearchScore" }, ...fields } }
//    ]);
//
// 3. The rest of the hybrid logic stays the same.
