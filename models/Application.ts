import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  scheme_name: { type: String, required: true },
  ministry: String,
  status: { 
    type: String, 
    enum: ['applied', 'review', 'verified', 'approved', 'rejected'],
    default: 'applied'
  },
  applied_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  remarks: String
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);