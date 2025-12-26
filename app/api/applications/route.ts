import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Application from '@/models/Application';

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const apps = await Application.find().sort({ updated_on: -1 });
  return NextResponse.json(apps);
}

export async function PUT(req: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { id, status } = await req.json();
    
    await Application.findByIdAndUpdate(id, { 
      status, 
      updated_on: new Date() 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}