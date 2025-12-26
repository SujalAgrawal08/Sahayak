import mongoose, { Schema, Document } from "mongoose";

export interface ISearchLog extends Document {
  query: string;
  category_detected: string; // e.g., "Loan", "Scholarship"
  user_location: string;     // e.g., "MP", "Delhi"
  timestamp: Date;
}

const SearchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true },
    category_detected: { type: String, default: "General" },
    user_location: { type: String, default: "Unknown" },
    timestamp: { type: Date, default: Date.now },
  },
  { expireAfterSeconds: 2592000 } // Auto-delete logs after 30 days (SDE optimization: TTL Index)
);

export default mongoose.models.SearchLog || mongoose.model<ISearchLog>("SearchLog", SearchLogSchema);