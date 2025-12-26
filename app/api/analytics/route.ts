import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SearchLog from '@/models/SearchLog';

export async function GET() {
  try {
    await dbConnect();

    // AGGREGATION 1: Top Search Categories
    const categoryStats = await SearchLog.aggregate([
      {
        $group: {
          _id: "$category_detected", // Group by category
          count: { $sum: 1 }         // Count how many
        }
      },
      { $sort: { count: -1 } }       // Sort highest first
    ]);

    // AGGREGATION 2: Searches over Time (Last 24h)
    // (Simplified for demo)
    const totalSearches = await SearchLog.countDocuments();

    return NextResponse.json({
      total: totalSearches,
      categories: categoryStats.map(s => ({ name: s._id, value: s.count })),
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}