/**
 * Search API — Hybrid Semantic + Keyword Search
 * 
 * Previous: Groq LLM keyword extraction → MongoDB regex (LLM-dependent, slow)
 * Current:  Local embedding → cosine similarity + keyword boost (fast, free, genuinely semantic)
 * 
 * Upgrade Path: Replace in-app similarity with MongoDB Atlas $vectorSearch
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SearchLog from '@/models/SearchLog';
import { hybridSearch, semanticSearch } from '@/lib/vectorSearch';

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { query, method = 'hybrid' } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    // Ensure DB connected (for cache + logging)
    if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Execute search based on method
    let results;
    if (method === 'semantic') {
      results = await semanticSearch(query, { topK: 5 });
    } else {
      results = await hybridSearch(query, { topK: 5 });
    }

    const latency = Date.now() - startTime;

    // Log search with metrics
    try {
      await SearchLog.create({
        query,
        search_method: method === 'semantic' ? 'pure_semantic' : 'hybrid_semantic',
        top_result_score: results.length > 0 ? results[0].combinedScore : 0,
        result_count: results.length,
        latency_ms: latency,
        semantic_scores: results.map(r => r.semanticScore),
      });
    } catch (logErr) {
      // Non-blocking: don't fail search if logging fails
      console.warn('[Search] Log write failed:', logErr);
    }

    console.log(`[Search] "${query}" → ${results.length} results (${latency}ms, method=${method})`);

    // Return full scheme data with scores
    const response = results.map(r => ({
      ...r.scheme,
      _searchMeta: {
        semanticScore: Math.round(r.semanticScore * 1000) / 1000,
        keywordScore: Math.round(r.keywordScore * 1000) / 1000,
        combinedScore: Math.round(r.combinedScore * 1000) / 1000,
        method: r.method,
      },
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}