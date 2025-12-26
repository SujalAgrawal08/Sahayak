import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';

// Get single post details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await mongoose.connect(process.env.MONGODB_URI!);
  const post = await Post.findById(params.id);
  return NextResponse.json(post);
}

// Add a reply
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json(); // { author, content, author_image }
    
    const post = await Post.findById(params.id);
    post.replies.push(body);
    await post.save();
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
}