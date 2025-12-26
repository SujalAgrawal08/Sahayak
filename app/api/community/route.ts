import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/Post';

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const posts = await Post.find().sort({ createdAt: -1 });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const body = await req.json();
    const newPost = await Post.create(body);
    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 });
  }
}