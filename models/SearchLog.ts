import mongoose, { Schema, Document } from "mongoose";

export interface ISearchLog extends Document {
  query: string;
  category_detected: string;      // e.g., "Loan", "Scholarship"
  user_location: string;          // e.g., "MP", "Delhi"
  search_method: string;          // "hybrid_semantic", "keyword", "semantic"
  top_result_score: number;       // cosine similarity of top result [0,1]
  result_count: number;           // number of results returned
  latency_ms: number;             // end-to-end search latency
  semantic_scores: number[];      // top-K similarity scores for analysis
  timestamp: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true },
    category_detected: { type: String, default: "General" },
    user_location: { type: String, default: "Unknown" },
    search_method: { type: String, default: "keyword" },
    top_result_score: { type: Number, default: 0 },
    result_count: { type: Number, default: 0 },
    latency_ms: { type: Number, default: 0 },
    semantic_scores: { type: [Number], default: [] },
    timestamp: { type: Date, default: Date.now },
  },
  { expireAfterSeconds: 2592000 } // Auto-delete logs after 30 days (TTL Index)
);

export default mongoose.models.SearchLog || mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);