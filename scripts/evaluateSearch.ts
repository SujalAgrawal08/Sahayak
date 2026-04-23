/**
 * Search Evaluation Script — Measures Semantic Search Quality
 * 
 * Usage: npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/evaluateSearch.ts
 * 
 * Runs a ground-truth evaluation dataset against the hybrid search system
 * and reports Precision@5, Recall@5, MRR, NDCG@5, and latency.
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// --- Ground Truth Evaluation Dataset ---
// Maps natural language queries to expected scheme names

const EVAL_DATASET = [
  {
    query: "I need money for my crops",
    expected: ["PM Kisan Samman Nidhi", "Kisan Credit Card (KCC)", "Pradhan Mantri Fasal Bima Yojana"],
  },
  {
    query: "scholarship for poor SC student",
    expected: ["Post Matric Scholarship for SC", "Central Sector Scholarship"],
  },
  {
    query: "loan for small business",
    expected: ["PM Mudra Yojana (Shishu)", "PMEGP", "PM SVANidhi"],
  },
  {
    query: "help for pregnant women",
    expected: ["Pradhan Mantri Matru Vandana Yojana"],
  },
  {
    query: "girl child savings scheme",
    expected: ["Sukanya Samriddhi Yojana"],
  },
  {
    query: "crop insurance for farmers",
    expected: ["Pradhan Mantri Fasal Bima Yojana", "PM Kisan Samman Nidhi"],
  },
  {
    query: "health insurance for poor families",
    expected: ["Ayushman Bharat"],
  },
  {
    query: "house for low income family",
    expected: ["Pradhan Mantri Awas Yojana (Urban)"],
  },
  {
    query: "pension for workers",
    expected: ["Atal Pension Yojana"],
  },
  {
    query: "technical education scholarship for girls",
    expected: ["AICTE Pragati Scholarship for Girls", "Central Sector Scholarship"],
  },
  {
    query: "street vendor loan scheme",
    expected: ["PM SVANidhi", "PM Mudra Yojana (Shishu)"],
  },
  {
    query: "self employment scheme for youth",
    expected: ["PMEGP", "PM Mudra Yojana (Shishu)"],
  },
  {
    query: "sewing machine for poor women",
    expected: ["Free Sewing Machine Scheme"],
  },
  {
    query: "financial help for women in MP",
    expected: ["Ladli Behna Yojana (MP)"],
  },
  {
    query: "education loan for Bihar students",
    expected: ["Bihar Student Credit Card Scheme"],
  },
  {
    query: "school dropout prevention scholarship",
    expected: ["National Means-cum-Merit Scholarship"],
  },
];

// --- Inline metric functions (to avoid import issues in scripts) ---

function precisionAtK(retrieved: string[], relevant: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  return topK.filter(id => relevantSet.has(id)).length / k;
}

function recallAtK(retrieved: string[], relevant: string[], k: number): number {
  if (relevant.length === 0) return 0;
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  return topK.filter(id => relevantSet.has(id)).length / relevant.length;
}

function mrr(retrieved: string[], relevant: string[]): number {
  const relevantSet = new Set(relevant);
  for (let i = 0; i < retrieved.length; i++) {
    if (relevantSet.has(retrieved[i])) return 1 / (i + 1);
  }
  return 0;
}

function ndcgAtK(retrieved: string[], relevant: string[], k: number): number {
  const relevantSet = new Set(relevant);
  const topK = retrieved.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevantSet.has(topK[i])) dcg += 1 / Math.log2(i + 2);
  }
  let idcg = 0;
  for (let i = 0; i < Math.min(k, relevant.length); i++) {
    idcg += 1 / Math.log2(i + 2);
  }
  return idcg === 0 ? 0 : dcg / idcg;
}

// --- Inline search logic (to avoid complex imports) ---

const SchemeSchema = new mongoose.Schema({
  name: String, description: String, category: String, ministry: String, url: String,
  rules: { age_min: Number, age_max: Number, income_max: Number, gender: String, caste: [String], occupation: [String], state: [String] },
  required_docs: [String],
  description_embedding: { type: [Number], select: false },
});
const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);

let extractor: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  const clean = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const output = await extractor(clean, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]**2; nb += b[i]**2; }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

// --- Main Evaluation ---

async function evaluate() {
  console.log('📊 SahayakX — Semantic Search Evaluation');
  console.log('='.repeat(60));
  
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ Connected to MongoDB\n');
  
  // Load all schemes with embeddings
  const schemes = await Scheme.find({}).select('+description_embedding').lean();
  const schemesWithVectors = (schemes as any[]).filter(s => s.description_embedding?.length > 0);
  
  console.log(`📦 ${schemes.length} schemes loaded, ${schemesWithVectors.length} with embeddings\n`);
  
  if (schemesWithVectors.length === 0) {
    console.error('❌ No embeddings found! Run seedWithEmbeddings.ts first.');
    process.exit(1);
  }
  
  // Run evaluation
  const results: any[] = [];
  
  for (const testCase of EVAL_DATASET) {
    const start = Date.now();
    
    // Embed query
    const queryVec = await getEmbedding(testCase.query);
    
    // Compute similarity with all schemes
    const scored = schemesWithVectors.map(s => ({
      name: s.name,
      score: cosineSimilarity(queryVec, s.description_embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    
    const latency = Date.now() - start;
    const retrieved = scored.slice(0, 5).map(s => s.name);
    
    const p5 = precisionAtK(retrieved, testCase.expected, 5);
    const r5 = recallAtK(retrieved, testCase.expected, 5);
    const mrrScore = mrr(retrieved, testCase.expected);
    const ndcg5 = ndcgAtK(retrieved, testCase.expected, 5);
    
    results.push({
      query: testCase.query,
      expected: testCase.expected,
      retrieved,
      topScores: scored.slice(0, 3).map(s => `${s.name}: ${s.score.toFixed(3)}`),
      p5, r5, mrrScore, ndcg5, latency,
    });
    
    // Print per-query result
    const p5Color = p5 >= 0.4 ? '✅' : '⚠️';
    const r5Color = r5 >= 0.5 ? '✅' : '⚠️';
    console.log(`${p5Color} "${testCase.query}"`);
    console.log(`   P@5=${p5.toFixed(2)} R@5=${r5.toFixed(2)} MRR=${mrrScore.toFixed(2)} NDCG@5=${ndcg5.toFixed(2)} (${latency}ms)`);
    console.log(`   Top: ${scored.slice(0, 3).map(s => `${s.name}(${s.score.toFixed(2)})`).join(' | ')}`);
    console.log();
  }
  
  // Aggregate
  const n = results.length;
  const avgP5 = results.reduce((s, r) => s + r.p5, 0) / n;
  const avgR5 = results.reduce((s, r) => s + r.r5, 0) / n;
  const avgMRR = results.reduce((s, r) => s + r.mrrScore, 0) / n;
  const avgNDCG = results.reduce((s, r) => s + r.ndcg5, 0) / n;
  const avgLatency = results.reduce((s, r) => s + r.latency, 0) / n;
  
  console.log('='.repeat(60));
  console.log('📊 AGGREGATE RESULTS');
  console.log('='.repeat(60));
  console.log(`   Queries Evaluated:  ${n}`);
  console.log(`   Avg Precision@5:    ${avgP5.toFixed(3)}`);
  console.log(`   Avg Recall@5:       ${avgR5.toFixed(3)}`);
  console.log(`   Avg MRR:            ${avgMRR.toFixed(3)}`);
  console.log(`   Avg NDCG@5:         ${avgNDCG.toFixed(3)}`);
  console.log(`   Avg Latency:        ${avgLatency.toFixed(0)}ms`);
  console.log('='.repeat(60));
  
  // Verdict
  if (avgR5 >= 0.5 && avgMRR >= 0.5) {
    console.log('\n🎉 PASS — Semantic search quality is defensible for interviews.');
  } else {
    console.log('\n⚠️  NEEDS IMPROVEMENT — Consider enriching scheme descriptions or tuning the model.');
  }
  
  process.exit(0);
}

evaluate().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
