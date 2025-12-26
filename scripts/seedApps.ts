import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ApplicationSchema = new mongoose.Schema({
  scheme_name: String,
  ministry: String,
  status: String,
  applied_on: Date,
  updated_on: Date,
  remarks: String
});
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

const DUMMY_APPS = [
  { scheme_name: "PM Kisan Samman Nidhi", ministry: "Agriculture", status: "approved", remarks: "Funds disbursed." },
  { scheme_name: "Ladli Behna Yojana", ministry: "MP Govt", status: "review", remarks: "Document verification pending." },
  { scheme_name: "Ayushman Bharat", ministry: "Health", status: "applied", remarks: "Application submitted." },
  { scheme_name: "PMEGP Loan", ministry: "MSME", status: "rejected", remarks: "Income criteria not met." },
  { scheme_name: "Post Matric Scholarship", ministry: "Education", status: "verified", remarks: "Bank details confirmed." }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    await Application.deleteMany({});
    await Application.insertMany(DUMMY_APPS);
    console.log("✅ Applications seeded!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
seed();