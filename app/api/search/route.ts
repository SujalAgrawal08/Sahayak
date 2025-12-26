import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Scheme from '@/models/Scheme';
import { getEmbedding } from '@/lib/embedding';
import { Redis } from '@upstash/redis';
import { ratelimit } from '@/lib/ratelimit';
import SearchLog from '@/models/SearchLog';
// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  try {

    // Get user IP to track them (In localhost it might be "127.0.0.1")
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Check if they are blocked
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many searches! Please wait 10 seconds." }, 
        { status: 429 } // 429 = Too Many Requests
      );
    }
    const { query } = await req.json();

    // 1. CACHE CHECK: Create a unique key for this search
    // We lowercase and trim to ensure "Shop Loan" and "shop loan" are the same
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    
    // Check if we have the answer in memory
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      console.log("⚡ CACHE HIT (Served from Redis)");
      return NextResponse.json(cachedResult);
    }

    console.log("🐢 CACHE MISS (Running AI Search)");

    (async () => {
      try {
        await dbConnect();
        // Simple heuristic to guess category for the log
        let category = "General";
        if (query.toLowerCase().includes("loan") || query.toLowerCase().includes("money")) category = "Finance";
        if (query.toLowerCase().includes("student") || query.toLowerCase().includes("study")) category = "Education";
        if (query.toLowerCase().includes("farm") || query.toLowerCase().includes("kisan")) category = "Agriculture";

        await SearchLog.create({
          query: query,
          category_detected: category,
          user_location: "India", // Ideally, you'd get this from IP or User Profile
        });
      } catch (err) {
        console.error("Logging failed", err); // Never crash the main app if logging fails
      }
    })();

    // 2. IF MISS: Run the heavy AI Logic
    await dbConnect();
    const queryVector = await getEmbedding(query);

    const results = await Scheme.aggregate([
      {
        "$vectorSearch": {
          "index": "default",
          "path": "description_embedding",
          "queryVector": queryVector,
          "numCandidates": 50,
          "limit": 5
        }
      },
      {
        "$project": {
          "description_embedding": 0,
          "score": { "$meta": "vectorSearchScore" }
        }
      }
    ]);

    // 3. CACHE SET: Save the result for next time
    // Expire in 1 hour (3600 seconds) so old data doesn't stay forever
    await redis.set(cacheKey, results, { ex: 3600 });

    return NextResponse.json(results);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}