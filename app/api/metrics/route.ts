/**
 * Metrics API — Aggregated Search Performance Metrics
 * 
 * Returns search quality stats from SearchLog collection:
 * - Average latency
 * - Search method distribution
 * - Average relevance scores
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import SearchLog from '@/models/SearchLog';

export async function GET() {
  try {
    if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Aggregate metrics from search logs
    const metrics = await SearchLog.aggregate([
      {
        $group: {
          _id: null,
          total_searches: { $sum: 1 },
          avg_latency_ms: { $avg: "$latency_ms" },
          avg_top_score: { $avg: "$top_result_score" },
          avg_result_count: { $avg: "$result_count" },
          
          // Method distribution
          hybrid_count: {
            $sum: { $cond: [{ $eq: ["$search_method", "hybrid_semantic"] }, 1, 0] },
          },
          semantic_count: {
            $sum: { $cond: [{ $eq: ["$search_method", "pure_semantic"] }, 1, 0] },
          },
          keyword_count: {
            $sum: { $cond: [{ $eq: ["$search_method", "keyword"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = metrics[0] || {
      total_searches: 0,
      avg_latency_ms: 0,
      avg_top_score: 0,
      avg_result_count: 0,
      hybrid_count: 0,
      semantic_count: 0,
      keyword_count: 0,
    };

    // Recent searches (last 10)
    const recentSearches = await SearchLog.find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .select('query search_method top_result_score latency_ms result_count timestamp')
      .lean();

    return NextResponse.json({
      summary: {
        total_searches: result.total_searches,
        avg_latency_ms: Math.round(result.avg_latency_ms || 0),
        avg_top_relevance_score: Math.round((result.avg_top_score || 0) * 1000) / 1000,
        avg_results_per_query: Math.round((result.avg_result_count || 0) * 10) / 10,
      },
      method_distribution: {
        hybrid_semantic: result.hybrid_count,
        pure_semantic: result.semantic_count,
        keyword_fallback: result.keyword_count,
      },
      recent_searches: recentSearches,
    });

  } catch (error: any) {
    console.error("[Metrics API]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
