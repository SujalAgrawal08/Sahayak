// scripts/seed.ts
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ministry: String,
  benefits: [String],
  gender: { type: String, enum: ['Male', 'Female', 'All'], default: 'All' },
  age_min: { type: Number, default: 0 },
  age_max: { type: Number, default: 100 },
  income_max: { type: Number, default: 999999999 },
  caste: { type: [String], default: ['General', 'OBC', 'SC', 'ST'] },
  occupation: { type: [String], default: ['Student', 'Farmer', 'Unemployed', 'Business'] },
  state: { type: String, default: 'India' },
  required_docs: [String],
});

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', SchemeSchema);

const REAL_SCHEMES = [
  // --- FARMERS ---
  {
    name: "PM Kisan Samman Nidhi",
    description: "₹6,000 per year income support for all landholding farmer families.",
    ministry: "Ministry of Agriculture",
    benefits: ["₹6,000/year via DBT"],
    gender: "All", age_min: 18, age_max: 100, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Farmer"], state: "India",
    required_docs: ["Aadhar Card", "Land Papers", "Bank Passbook"]
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    description: "Crop insurance scheme integrating multiple stakeholders.",
    ministry: "Ministry of Agriculture",
    benefits: ["Crop Failure Insurance"],
    gender: "All", age_min: 18, age_max: 100, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Farmer"], state: "India",
    required_docs: ["Land Papers", "Aadhar Card"]
  },
  {
    name: "Kisan Credit Card (KCC)",
    description: "Credit to farmers for agricultural expenses.",
    ministry: "Ministry of Finance",
    benefits: ["Low interest loans", "Flexible repayment"],
    gender: "All", age_min: 18, age_max: 75, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Farmer"], state: "India",
    required_docs: ["Land Records", "Aadhar Card", "PAN Card"]
  },
  
  // --- STUDENTS / EDUCATION ---
  {
    name: "Central Sector Scholarship",
    description: "Financial support for meritorious students from low-income families.",
    ministry: "Ministry of Education",
    benefits: ["₹10,000 - ₹20,000 per year"],
    gender: "All", age_min: 18, age_max: 25, income_max: 800000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "India",
    required_docs: ["Class 12 Marksheet", "Income Certificate"]
  },
  {
    name: "Post Matric Scholarship for SC",
    description: "Financial assistance for SC students for post-matriculation studies.",
    ministry: "Ministry of Social Justice",
    benefits: ["Tuition Fee Waiver"],
    gender: "All", age_min: 16, age_max: 30, income_max: 250000,
    caste: ["SC"], occupation: ["Student"], state: "India",
    required_docs: ["Caste Certificate", "Income Certificate"]
  },
  {
    name: "AICTE Pragati Scholarship for Girls",
    description: "Scholarship for girl students in technical education.",
    ministry: "AICTE",
    benefits: ["₹50,000 per annum"],
    gender: "Female", age_min: 17, age_max: 25, income_max: 800000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "India",
    required_docs: ["Admission Letter", "Income Certificate", "Aadhar"]
  },
  {
    name: "National Means-cum-Merit Scholarship",
    description: "Scholarship to arrest drop-out rate of students at class VIII.",
    ministry: "Ministry of Education",
    benefits: ["₹12,000 per annum"],
    gender: "All", age_min: 13, age_max: 16, income_max: 350000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "India",
    required_docs: ["Class 7 Marksheet", "Income Certificate"]
  },

  // --- WOMEN ---
  {
    name: "Pradhan Mantri Matru Vandana Yojana",
    description: "Maternity benefit for pregnant women and lactating mothers.",
    ministry: "Ministry of WCD",
    benefits: ["₹5,000 Cash Incentive"],
    gender: "Female", age_min: 19, age_max: 45, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Unemployed", "Farmer", "Business", "Student"], state: "India",
    required_docs: ["MCP Card", "Aadhar Card"]
  },
  {
    name: "Sukanya Samriddhi Yojana",
    description: "Small deposit scheme for the girl child.",
    ministry: "Ministry of Finance",
    benefits: ["High Interest Rate (8%+)"],
    gender: "Female", age_min: 0, age_max: 10, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "India",
    required_docs: ["Birth Certificate", "Parent KYC"]
  },
  {
    name: "Free Sewing Machine Scheme",
    description: "Providing free sewing machines to poor women to encourage self-employment.",
    ministry: "Ministry of MSME",
    benefits: ["Free Sewing Machine"],
    gender: "Female", age_min: 20, age_max: 40, income_max: 120000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Unemployed", "Business"], state: "India",
    required_docs: ["Income Certificate", "Age Proof"]
  },

  // --- BUSINESS / EMPLOYMENT ---
  {
    name: "PM Mudra Yojana (Shishu)",
    description: "Loan for small business owners.",
    ministry: "Ministry of Finance",
    benefits: ["Loan up to ₹50,000"],
    gender: "All", age_min: 18, age_max: 60, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Business", "Unemployed"], state: "India",
    required_docs: ["Business Plan", "KYC"]
  },
  {
    name: "PMEGP",
    description: "Credit-linked subsidy programme for employment generation.",
    ministry: "MSME",
    benefits: ["Subsidy up to 35%"],
    gender: "All", age_min: 18, age_max: 50, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Unemployed"], state: "India",
    required_docs: ["Project Report", "EDP Training"]
  },
  {
    name: "PM SVANidhi",
    description: "Micro-credit facility for street vendors.",
    ministry: "MoHUA",
    benefits: ["Loan up to ₹10,000", "Interest Subsidy"],
    gender: "All", age_min: 18, age_max: 65, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Business"], state: "India",
    required_docs: ["Vending Certificate", "Aadhar Card"]
  },

  // --- HOUSING / SOCIAL SECURITY ---
  {
    name: "Pradhan Mantri Awas Yojana (Urban)",
    description: "Housing for All in urban areas.",
    ministry: "MoHUA",
    benefits: ["Interest Subsidy on Home Loan"],
    gender: "All", age_min: 18, age_max: 70, income_max: 1800000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["All"], state: "India",
    required_docs: ["Income Proof", "Aadhar Card"]
  },
  {
    name: "Ayushman Bharat",
    description: "Health insurance cover of ₹5 Lakhs per family per year.",
    ministry: "MoHFW",
    benefits: ["₹5 Lakh Health Cover"],
    gender: "All", age_min: 0, age_max: 100, income_max: 250000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["All"], state: "India",
    required_docs: ["Ration Card", "Aadhar Card"]
  },
  {
    name: "Atal Pension Yojana",
    description: "Pension scheme for unorganized sector workers.",
    ministry: "Ministry of Finance",
    benefits: ["Guaranteed Pension ₹1k-5k/month"],
    gender: "All", age_min: 18, age_max: 40, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["All"], state: "India",
    required_docs: ["Bank Account", "Aadhar Card"]
  },

  // --- STATE SPECIFIC (MP/UP/BIHAR EXAMPLES) ---
  {
    name: "Ladli Behna Yojana (MP)",
    description: "Financial assistance to women in MP.",
    ministry: "MP Govt",
    benefits: ["₹1,250 per month"],
    gender: "Female", age_min: 21, age_max: 60, income_max: 250000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["All"], state: "MP",
    required_docs: ["Samagra ID", "Aadhar"]
  },
  {
    name: "Mukhyamantri Kanya Sumangala Yojana (UP)",
    description: "Financial help for girl child in UP.",
    ministry: "UP Govt",
    benefits: ["₹15,000 in phases"],
    gender: "Female", age_min: 0, age_max: 18, income_max: 300000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "UP",
    required_docs: ["Birth Certificate", "Address Proof"]
  },
  {
    name: "Bihar Student Credit Card Scheme",
    description: "Education loan for students in Bihar.",
    ministry: "Bihar Govt",
    benefits: ["Loan up to ₹4 Lakhs"],
    gender: "All", age_min: 18, age_max: 25, income_max: 9999999,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["Student"], state: "Bihar",
    required_docs: ["12th Marksheet", "Admission Proof"]
  },
  {
    name: "Rupashree Prakalpa (West Bengal)",
    description: "One-time grant for marriage of poor girls.",
    ministry: "WB Govt",
    benefits: ["₹25,000 One-time"],
    gender: "Female", age_min: 18, age_max: 40, income_max: 150000,
    caste: ["General", "OBC", "SC", "ST"], occupation: ["All"], state: "WB",
    required_docs: ["Marriage Invitation", "Income Proof"]
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🧹 Clearing old schemes...");
    await Scheme.deleteMany({});

    console.log(`🚀 Inserting ${REAL_SCHEMES.length} new schemes...`);
    await Scheme.insertMany(REAL_SCHEMES);

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();