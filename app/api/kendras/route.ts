/**
 * Kendras API — Geospatial Center Discovery with Distance Ranking
 * 
 * Previous: Basic $near query returning unordered results
 * Current: $geoNear aggregation returning sorted results WITH computed distances
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Kendra from '@/models/Kendra';

export async function GET(req: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      // Use $geoNear aggregation for distance-based ranking
      const kendras = await Kendra.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            distanceField: "distance_meters",   // Computed distance in meters
            maxDistance: 500000,                  // 500 km radius
            spherical: true,
          },
        },
        { $limit: 20 },
        {
          $addFields: {
            distance_km: {
              $round: [{ $divide: ["$distance_meters", 1000] }, 1],
            },
          },
        },
        { $sort: { distance_meters: 1 } },       // Nearest first
      ]);

      return NextResponse.json(kendras);
    }

    // Fallback: No coordinates provided
    const kendras = await Kendra.find({}).limit(20);
    return NextResponse.json(kendras);
    
  } catch (error: any) {
    console.error("[Kendras API]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}