/**
 * Embedding Cache — Avoids re-fetching scheme vectors on every search
 * 
 * Current: In-memory Map with TTL (works in serverless with warm functions)
 * Upgrade Path: Replace with Upstash Redis (already in package.json) for cross-instance caching
 */

import mongoose from 'mongoose';
import Scheme from '@/models/Scheme';

// --- Types ---
export interface CachedSchemeEmbedding {
  scheme: any;
  embedding: number[];
}

// --- In-Memory Cache ---
let schemeCache: CachedSchemeEmbedding[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get scheme embeddings from cache or DB.
 * 
 * Strategy:
 * - First call: loads all schemes + embeddings from MongoDB
 * - Subsequent calls within TTL: returns cached data
 * - After TTL expires: refreshes from DB
 * 
 * For production with 1000+ schemes, replace with:
 * - Upstash Redis (import { Redis } from '@upstash/redis')
 * - Or just use Atlas Vector Search (no client-side caching needed)
 */
export async function getSchemeEmbeddingCache(): Promise<CachedSchemeEmbedding[]> {
  const now = Date.now();
  
  // Return cached data if fresh
  if (schemeCache && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return schemeCache;
  }
  
  // Refresh from DB
  try {
    if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Use .select('+description_embedding') because the field has select: false
    const schemes = await Scheme.find({})
      .select('+description_embedding')
      .lean();
    
    schemeCache = schemes.map((s: any) => ({
      scheme: {
        _id: s._id,
        name: s.name,
        description: s.description,
        ministry: s.ministry,
        category: s.category,
        url: s.url,
        rules: s.rules,
        required_docs: s.required_docs,
      },
      embedding: s.description_embedding || [],
    }));
    
    cacheTimestamp = now;
    
    const withEmbeddings = schemeCache.filter(s => s.embedding.length > 0).length;
    console.log(`[Cache] Loaded ${schemeCache.length} schemes (${withEmbeddings} with embeddings)`);
    
    return schemeCache;
  } catch (error) {
    console.error('[Cache] Failed to load scheme embeddings:', error);
    return schemeCache || []; // Return stale cache if available
  }
}

/**
 * Force cache invalidation — call after seeding or updating schemes.
 */
export function invalidateSchemeCache(): void {
  schemeCache = null;
  cacheTimestamp = 0;
  console.log('[Cache] Scheme embedding cache invalidated');
}

// --- UPGRADE PATH: Redis Cache ---
//
// Replace the in-memory cache with Upstash Redis for multi-instance deployments:
//
// import { Redis } from '@upstash/redis';
// const redis = Redis.fromEnv();
//
// export async function getSchemeEmbeddingCache(): Promise<CachedSchemeEmbedding[]> {
//   const cached = await redis.get<CachedSchemeEmbedding[]>('scheme_embeddings');
//   if (cached) return cached;
//
//   const schemes = await Scheme.find({}).select('+description_embedding').lean();
//   const mapped = schemes.map(s => ({ scheme: s, embedding: s.description_embedding || [] }));
//
//   await redis.set('scheme_embeddings', mapped, { ex: 300 }); // 5min TTL
//   return mapped;
// }
