/**
 * Database Seed Script WITH Embeddings
 * 
 * Usage: npx ts-node --compiler-options "{\"module\":\"commonjs\"}" scripts/seedWithEmbeddings.ts
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Clears existing schemes
 * 3. For each scheme, generates an embedding from concatenated text
 * 4. Inserts schemes WITH vectors into the database
 * 5. Validates embedding dimensions
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// --- Inline Schema (matches models/Scheme.ts) ---
const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ministry: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String, required: true },
  rules: {
    age_min: { type: Number, default: 0 },
    age_max: { type: Number, default: 100 },
    income_max: { type: Number, default: 999999999 },
    gender: { type: String, default: "All" },
    caste: { type: [String], default: ["All"] },
    occupation: { type: [String], default: ["All"] },
    state: { type: [String], default: ["All"] },
  },
  required_docs: { type: [String], default: [] },
  description_embedding: { type: [Number], select: false },
});

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);

// --- Inline Embedding (avoids import path issues in scripts) ---
let extractor: any = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    // Dynamic import for @xenova/transformers
    const { pipeline } = await import('@xenova/transformers');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded');
  }
  
  const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
  const output = await extractor(cleanText, { pooling: 'mean', normalize: true });
  return Array.from(output.data) as number[];
}

function buildEmbeddingText(scheme: any): string {
  const occupations = Array.isArray(scheme.rules?.occupation) 
    ? scheme.rules.occupation.join(', ') 
    : '';
  
  return [
    scheme.name,
    scheme.description,
    scheme.category,
    occupations,
  ].filter(Boolean).join('. ');
}

// --- Scheme Data ---
const SCHEMES = [
  {
    name: "PM Kisan Samman Nidhi",
    description: "Financial benefit of Rs 6000 per year to eligible farmer families for income support. Covers all landholding farmer families across India.",
    ministry: "Ministry of Agriculture",
    url: "https://pmkisan.gov.in/",
    category: "Agriculture",
    rules: {
      age_min: 18, age_max: 100, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Farmer"], state: ["All"],
    },
    required_docs: ["Aadhar Card", "Land Holding Document", "Bank Account"],
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme protecting farmers against crop loss due to natural calamities, pests and diseases.",
    ministry: "Ministry of Agriculture",
    url: "https://pmfby.gov.in/",
    category: "Agriculture",
    rules: {
      age_min: 18, age_max: 100, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Farmer"], state: ["All"],
    },
    required_docs: ["Land Papers", "Aadhar Card"],
  },
  {
    name: "Kisan Credit Card (KCC)",
    description: "Credit facility to farmers for agricultural expenses, purchase of inputs, and investment credit at low interest rates.",
    ministry: "Ministry of Finance",
    url: "https://www.india.gov.in/",
    category: "Agriculture",
    rules: {
      age_min: 18, age_max: 75, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Farmer"], state: ["All"],
    },
    required_docs: ["Land Records", "Aadhar Card", "PAN Card"],
  },
  {
    name: "Central Sector Scholarship",
    description: "Financial support for meritorious students from low-income families pursuing higher education in recognized institutions.",
    ministry: "Ministry of Education",
    url: "https://scholarships.gov.in/",
    category: "Education",
    rules: {
      age_min: 18, age_max: 25, income_max: 800000,
      gender: "All", caste: ["All"], occupation: ["Student"], state: ["All"],
    },
    required_docs: ["Class 12 Marksheet", "Income Certificate"],
  },
  {
    name: "Post Matric Scholarship for SC",
    description: "Financial assistance to Scheduled Caste students studying at post-matriculation level for tuition fees and maintenance.",
    ministry: "Ministry of Social Justice",
    url: "https://scholarships.gov.in/",
    category: "Education",
    rules: {
      age_min: 16, age_max: 30, income_max: 250000,
      gender: "All", caste: ["SC"], occupation: ["Student"], state: ["All"],
    },
    required_docs: ["Caste Certificate", "Income Certificate", "Mark Sheet"],
  },
  {
    name: "AICTE Pragati Scholarship for Girls",
    description: "Scholarship for girl students in technical education to encourage women in STEM fields.",
    ministry: "AICTE",
    url: "https://www.aicte-india.org/",
    category: "Education",
    rules: {
      age_min: 17, age_max: 25, income_max: 800000,
      gender: "Female", caste: ["All"], occupation: ["Student"], state: ["All"],
    },
    required_docs: ["Admission Letter", "Income Certificate", "Aadhar"],
  },
  {
    name: "National Means-cum-Merit Scholarship",
    description: "Scholarship to arrest drop-out rate of meritorious students at class VIII level from economically weaker families.",
    ministry: "Ministry of Education",
    url: "https://scholarships.gov.in/",
    category: "Education",
    rules: {
      age_min: 13, age_max: 16, income_max: 350000,
      gender: "All", caste: ["All"], occupation: ["Student"], state: ["All"],
    },
    required_docs: ["Class 7 Marksheet", "Income Certificate"],
  },
  {
    name: "Pradhan Mantri Matru Vandana Yojana",
    description: "Maternity benefit programme providing cash incentive to pregnant women and lactating mothers for first living child.",
    ministry: "Ministry of WCD",
    url: "https://wcd.nic.in/",
    category: "Women & Child",
    rules: {
      age_min: 19, age_max: 45, income_max: 999999999,
      gender: "Female", caste: ["All"], occupation: ["All"], state: ["All"],
    },
    required_docs: ["MCP Card", "Aadhar Card"],
  },
  {
    name: "Sukanya Samriddhi Yojana",
    description: "Small deposit savings scheme for the girl child with high interest rate for their future education and marriage expenses.",
    ministry: "Ministry of Finance",
    url: "https://www.nsiindia.gov.in/",
    category: "Women & Child",
    rules: {
      age_min: 0, age_max: 10, income_max: 999999999,
      gender: "Female", caste: ["All"], occupation: ["All"], state: ["All"],
    },
    required_docs: ["Birth Certificate", "Parent KYC"],
  },
  {
    name: "Free Sewing Machine Scheme",
    description: "Providing free sewing machines to poor and needy women to encourage self-employment and economic independence.",
    ministry: "Ministry of MSME",
    url: "https://www.india.gov.in/",
    category: "Women & Child",
    rules: {
      age_min: 20, age_max: 40, income_max: 120000,
      gender: "Female", caste: ["All"], occupation: ["Unemployed", "Business"], state: ["All"],
    },
    required_docs: ["Income Certificate", "Age Proof"],
  },
  {
    name: "PM Mudra Yojana (Shishu)",
    description: "Micro-unit loan up to Rs 50,000 for small and micro business owners for business development and working capital.",
    ministry: "Ministry of Finance",
    url: "https://www.mudra.org.in/",
    category: "Business",
    rules: {
      age_min: 18, age_max: 60, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Business", "Unemployed"], state: ["All"],
    },
    required_docs: ["Business Plan", "KYC"],
  },
  {
    name: "PMEGP",
    description: "Prime Minister Employment Generation Programme - credit-linked subsidy for setting up micro enterprises to generate employment.",
    ministry: "MSME",
    url: "https://www.kviconline.gov.in/",
    category: "Business",
    rules: {
      age_min: 18, age_max: 50, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Unemployed"], state: ["All"],
    },
    required_docs: ["Project Report", "EDP Training"],
  },
  {
    name: "PM SVANidhi",
    description: "Micro-credit facility for street vendors to resume their livelihood activities with affordable working capital loan.",
    ministry: "MoHUA",
    url: "https://pmsvanidhi.mohua.gov.in/",
    category: "Business",
    rules: {
      age_min: 18, age_max: 65, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Business"], state: ["All"],
    },
    required_docs: ["Vending Certificate", "Aadhar Card"],
  },
  {
    name: "Pradhan Mantri Awas Yojana (Urban)",
    description: "Housing for All scheme providing interest subsidy on home loans for first-time home buyers in urban areas.",
    ministry: "MoHUA",
    url: "https://pmaymis.gov.in/",
    category: "Housing",
    rules: {
      age_min: 18, age_max: 70, income_max: 1800000,
      gender: "All", caste: ["All"], occupation: ["All"], state: ["All"],
    },
    required_docs: ["Income Proof", "Aadhar Card", "Property Documents"],
  },
  {
    name: "Ayushman Bharat",
    description: "National health insurance scheme providing health cover of Rs 5 Lakhs per family per year for secondary and tertiary hospitalization.",
    ministry: "MoHFW",
    url: "https://pmjay.gov.in/",
    category: "Health",
    rules: {
      age_min: 0, age_max: 100, income_max: 250000,
      gender: "All", caste: ["All"], occupation: ["All"], state: ["All"],
    },
    required_docs: ["Ration Card", "Aadhar Card"],
  },
  {
    name: "Atal Pension Yojana",
    description: "Guaranteed pension scheme for workers in unorganized sector providing monthly pension of Rs 1000 to Rs 5000 after 60 years of age.",
    ministry: "Ministry of Finance",
    url: "https://www.india.gov.in/",
    category: "Social Security",
    rules: {
      age_min: 18, age_max: 40, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["All"], state: ["All"],
    },
    required_docs: ["Bank Account", "Aadhar Card"],
  },
  {
    name: "Ladli Behna Yojana (MP)",
    description: "Financial assistance of Rs 1250 per month to women in Madhya Pradesh for economic empowerment.",
    ministry: "MP Govt",
    url: "https://cmladlibahna.mp.gov.in/",
    category: "Women Welfare",
    rules: {
      age_min: 21, age_max: 60, income_max: 250000,
      gender: "Female", caste: ["All"], occupation: ["All"], state: ["MP"],
    },
    required_docs: ["Samagra ID", "Aadhar"],
  },
  {
    name: "Mukhyamantri Kanya Sumangala Yojana (UP)",
    description: "Financial help for girl child in Uttar Pradesh at different stages of life including birth, education and marriage.",
    ministry: "UP Govt",
    url: "https://mksy.up.gov.in/",
    category: "Women & Child",
    rules: {
      age_min: 0, age_max: 18, income_max: 300000,
      gender: "Female", caste: ["All"], occupation: ["Student"], state: ["UP"],
    },
    required_docs: ["Birth Certificate", "Address Proof"],
  },
  {
    name: "Bihar Student Credit Card Scheme",
    description: "Education loan up to Rs 4 Lakhs for students in Bihar for higher education at low interest rates.",
    ministry: "Bihar Govt",
    url: "https://www.7nishchay-yuvaupmission.bihar.gov.in/",
    category: "Education",
    rules: {
      age_min: 18, age_max: 25, income_max: 999999999,
      gender: "All", caste: ["All"], occupation: ["Student"], state: ["Bihar"],
    },
    required_docs: ["12th Marksheet", "Admission Proof"],
  },
  {
    name: "Rupashree Prakalpa (West Bengal)",
    description: "One-time financial grant for marriage of economically disadvantaged girls in West Bengal.",
    ministry: "WB Govt",
    url: "https://wbrupashree.gov.in/",
    category: "Women Welfare",
    rules: {
      age_min: 18, age_max: 40, income_max: 150000,
      gender: "Female", caste: ["All"], occupation: ["All"], state: ["WB"],
    },
    required_docs: ["Marriage Invitation", "Income Proof"],
  },
];

// --- Main Seed Function ---

async function seedWithEmbeddings() {
  console.log('🌱 SahayakX — Seed with Embeddings');
  console.log('='.repeat(50));
  
  // 1. Connect
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('❌ MONGODB_URI not set'); process.exit(1); }
  
  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected');
  
  // 2. Clear
  console.log('🧹 Clearing old schemes...');
  await Scheme.deleteMany({});
  
  // 3. Generate embeddings + insert
  console.log(`🧠 Generating embeddings for ${SCHEMES.length} schemes...`);
  console.log('   (First run downloads ~40MB model, subsequent runs are cached)\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [index, scheme] of SCHEMES.entries()) {
    try {
      const embeddingText = buildEmbeddingText(scheme);
      const embedding = await getEmbedding(embeddingText);
      
      await Scheme.create({
        ...scheme,
        description_embedding: embedding,
      });
      
      successCount++;
      console.log(`   ✅ [${index + 1}/${SCHEMES.length}] ${scheme.name} (${embedding.length}-dim)`);
    } catch (error) {
      failCount++;
      console.error(`   ❌ [${index + 1}/${SCHEMES.length}] ${scheme.name}:`, error);
      
      // Insert without embedding as fallback
      await Scheme.create(scheme);
    }
  }
  
  // 4. Summary
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Seeding complete!`);
  console.log(`   ✅ ${successCount} schemes with embeddings`);
  if (failCount > 0) console.log(`   ❌ ${failCount} schemes without embeddings`);
  console.log(`   📊 Total: ${SCHEMES.length} schemes in database`);
  
  // 5. Verify
  const verifyCount = await Scheme.countDocuments({});
  const withEmbeddings = await Scheme.find({}).select('+description_embedding').lean();
  const hasVectors = withEmbeddings.filter((s: any) => s.description_embedding?.length > 0).length;
  console.log(`   🔍 Verified: ${verifyCount} docs, ${hasVectors} with vectors`);
  
  process.exit(0);
}

seedWithEmbeddings().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
