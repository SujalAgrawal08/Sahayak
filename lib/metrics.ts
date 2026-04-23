/**
 * Search Evaluation Metrics — Information Retrieval Standard Measures
 * 
 * Implements: Precision@K, Recall@K, MRR, NDCG@K
 * Used by: evaluateSearch.ts script and /api/metrics endpoint
 */

// --- Core Metrics ---

/**
 * Precision@K: Of the top-K results, what fraction are relevant?
 * 
 * @param retrieved - IDs of retrieved results (ordered by rank)
 * @param relevant - IDs of ground-truth relevant results
 * @param k - cutoff position
 * @returns precision value [0, 1]
 */
export function precisionAtK(retrieved: string[], relevant: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  
  const hits = topK.filter(id => relevantSet.has(id)).length;
  return hits / k;
}

/**
 * Recall@K: Of all relevant items, what fraction appear in top-K?
 * 
 * @param retrieved - IDs of retrieved results (ordered by rank)
 * @param relevant - IDs of ground-truth relevant results
 * @param k - cutoff position
 * @returns recall value [0, 1]
 */
export function recallAtK(retrieved: string[], relevant: string[], k: number): number {
  if (relevant.length === 0) return 0;
  
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  
  const hits = topK.filter(id => relevantSet.has(id)).length;
  return hits / relevant.length;
}

/**
 * Mean Reciprocal Rank: What is the rank of the first relevant result?
 * 
 * @param retrieved - IDs of retrieved results (ordered by rank)
 * @param relevant - IDs of ground-truth relevant results
 * @returns MRR value [0, 1] (1 = first result is relevant)
 */
export function meanReciprocalRank(retrieved: string[], relevant: string[]): number {
  const relevantSet = new Set(relevant);
  
  for (let i = 0; i < retrieved.length; i++) {
    if (relevantSet.has(retrieved[i])) {
      return 1 / (i + 1);
    }
  }
  
  return 0;
}

/**
 * Normalized Discounted Cumulative Gain @K
 * Rewards relevant results appearing earlier in the ranking.
 */
export function ndcgAtK(retrieved: string[], relevant: string[], k: number): number {
  const relevantSet = new Set(relevant);
  const topK = retrieved.slice(0, k);
  
  // DCG
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevantSet.has(topK[i])) {
      dcg += 1 / Math.log2(i + 2); // +2 because log2(1) = 0
    }
  }
  
  // Ideal DCG (all relevant items at top)
  let idcg = 0;
  const idealK = Math.min(k, relevant.length);
  for (let i = 0; i < idealK; i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  
  return idcg === 0 ? 0 : dcg / idcg;
}

// --- Latency Tracking ---

export interface LatencyRecord {
  operation: string;
  latency_ms: number;
  timestamp: Date;
}

/**
 * Track operation latency.
 * Usage:
 *   const start = Date.now();
 *   // ... operation ...
 *   const record = trackLatency('semantic_search', start);
 */
export function trackLatency(operation: string, startTime: number): LatencyRecord {
  return {
    operation,
    latency_ms: Date.now() - startTime,
    timestamp: new Date(),
  };
}

// --- Aggregate Metrics ---

export interface EvaluationResult {
  query: string;
  expectedSchemes: string[];
  retrievedSchemes: string[];
  precision_at_5: number;
  recall_at_5: number;
  mrr: number;
  ndcg_at_5: number;
  latency_ms: number;
}

/**
 * Compute all metrics for a single query.
 */
export function evaluateQuery(
  query: string,
  retrieved: string[],
  relevant: string[],
  latency_ms: number
): EvaluationResult {
  return {
    query,
    expectedSchemes: relevant,
    retrievedSchemes: retrieved.slice(0, 5),
    precision_at_5: precisionAtK(retrieved, relevant, 5),
    recall_at_5: recallAtK(retrieved, relevant, 5),
    mrr: meanReciprocalRank(retrieved, relevant),
    ndcg_at_5: ndcgAtK(retrieved, relevant, 5),
    latency_ms,
  };
}

/**
 * Compute aggregate metrics across all evaluation queries.
 */
export function aggregateMetrics(results: EvaluationResult[]): {
  avg_precision: number;
  avg_recall: number;
  avg_mrr: number;
  avg_ndcg: number;
  avg_latency_ms: number;
  total_queries: number;
} {
  const n = results.length;
  if (n === 0) return { avg_precision: 0, avg_recall: 0, avg_mrr: 0, avg_ndcg: 0, avg_latency_ms: 0, total_queries: 0 };
  
  return {
    avg_precision: results.reduce((sum, r) => sum + r.precision_at_5, 0) / n,
    avg_recall: results.reduce((sum, r) => sum + r.recall_at_5, 0) / n,
    avg_mrr: results.reduce((sum, r) => sum + r.mrr, 0) / n,
    avg_ndcg: results.reduce((sum, r) => sum + r.ndcg_at_5, 0) / n,
    avg_latency_ms: results.reduce((sum, r) => sum + r.latency_ms, 0) / n,
    total_queries: n,
  };
}
