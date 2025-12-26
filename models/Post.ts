import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // User's name
  author_image: String,
  category: { type: String, default: 'General' },
  upvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  replies: [
    {
      author: String,
      author_image: String,
      content: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);