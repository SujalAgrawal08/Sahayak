import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Kendra from '@/models/Kendra';

export async function GET(req: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    let query = {};
    if (lat && lng) {
      // Find locations within 500km radius
      query = {
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 500000 // 500 km
          }
        }
      };
    }

    const kendras = await Kendra.find(query).limit(20);
    return NextResponse.json(kendras);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}