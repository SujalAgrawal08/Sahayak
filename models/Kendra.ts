import mongoose from 'mongoose';

const KendraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  contact: String,
  services: [String], // e.g., ["Aadhar", "Pan", "Banking"]
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  }
});

// Create a Geospatial Index for fast searching
KendraSchema.index({ location: '2dsphere' });

export default mongoose.models.Kendra || mongoose.model('Kendra', KendraSchema);