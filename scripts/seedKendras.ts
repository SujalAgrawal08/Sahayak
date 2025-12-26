import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Define Schema Inline for the script
const KendraSchema = new mongoose.Schema({
  name: String,
  address: String,
  contact: String,
  services: [String],
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }
  }
});
KendraSchema.index({ location: '2dsphere' });

const Kendra = mongoose.models.Kendra || mongoose.model('Kendra', KendraSchema);

const KENDRAS = [
  {
    name: "CSC Center - Bhopal Main",
    address: "Zone-1, MP Nagar, Bhopal, Madhya Pradesh",
    contact: "+91-9876543210",
    services: ["Aadhar Update", "Pan Card", "PM Kisan"],
    location: { type: "Point", coordinates: [77.4126, 23.2599] }
  },
  {
    name: "Jan Seva Kendra - Indore",
    address: "Vijay Nagar, Indore, Madhya Pradesh",
    contact: "+91-9988776655",
    services: ["Banking", "Insurance", "Scholarships"],
    location: { type: "Point", coordinates: [75.8577, 22.7196] }
  },
  {
    name: "Digital Seva - Delhi",
    address: "Connaught Place, New Delhi",
    contact: "+91-1122334455",
    services: ["Passport", "Voter ID", "Driving License"],
    location: { type: "Point", coordinates: [77.2167, 28.6328] }
  },
  {
    name: "E-Mitra Kendra - Jaipur",
    address: "Vaishali Nagar, Jaipur, Rajasthan",
    contact: "+91-8899001122",
    services: ["Birth Certificate", "Water Bill", "Pension"],
    location: { type: "Point", coordinates: [75.7873, 26.9124] }
  },
  {
    name: "Maha E-Seva - Mumbai",
    address: "Dadar West, Mumbai, Maharashtra",
    contact: "+91-7766554433",
    services: ["Property Tax", "Income Certificate", "Caste Certificate"],
    location: { type: "Point", coordinates: [72.8407, 19.0184] }
  }
];

async function seed() {
  try {
    console.log("🌱 Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI!);
    
    console.log("🧹 Clearing old kendras...");
    await Kendra.deleteMany({});
    
    console.log("🚀 Inserting new centers...");
    await Kendra.insertMany(KENDRAS);
    
    console.log("✅ Done! Indexes created.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();