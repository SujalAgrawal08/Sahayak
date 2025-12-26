import mongoose, { Schema, Document } from "mongoose";

export interface IScheme extends Document {
  name: string;
  ministry: string;
  description: string;
  url: string;
  category: string; // e.g., "Agriculture", "Education"
  rules: {
    age_min: number;
    age_max: number;
    income_max: number;
    gender: string; // "Male", "Female", "All"
    caste: string[]; // ["SC", "ST", "OBC", "General", "All"]
    occupation: string[]; // ["Farmer", "Student", "Unemployed", "All"]
    state: string[]; // ["All", "UP", "MP"]
  };
  required_docs: string[];
  description_embedding: number[];
}

const SchemeSchema = new Schema<IScheme>({
  name: { type: String, required: true },
  ministry: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String, required: true },
  
  rules: {
    age_min: { type: Number, default: 0 },
    age_max: { type: Number, default: 100 },
    income_max: { type: Number, default: 999999999 }, // Default: No income limit
    gender: { type: String, default: "All" },
    caste: { type: [String], default: ["All"] },
    occupation: { type: [String], default: ["All"] },
    state: { type: [String], default: ["All"] },
  },

  required_docs: { type: [String], default: [] },
  description_embedding: { type: [Number], select: false },
}, { timestamps: true });

export default mongoose.models.Scheme || mongoose.model<IScheme>("Scheme", SchemeSchema);