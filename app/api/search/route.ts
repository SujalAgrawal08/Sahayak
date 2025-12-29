import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Scheme from '@/models/Scheme';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) return NextResponse.json([]);

    // 1. Ask AI to extract "Searchable Keywords" from the natural language
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a search query optimizer. 
          User will give a problem (e.g., "I need money for crops").
          You must output 3-4 keywords related to Indian Government Schemes (e.g., "Farmer Agriculture Loan Kisan").
          Output ONLY the space-separated keywords.`
        },
        { role: "user", content: query }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const aiKeywords = chatCompletion.choices[0]?.message?.content || query;
    const searchTerms = (aiKeywords || "").split(" ").filter((w: string) => w.length > 2);

    console.log(`User: "${query}" -> AI Keywords:`, searchTerms);

    // 2. Connect & Search DB using Regex
    await mongoose.connect(process.env.MONGODB_URI!);

    const schemes = await Scheme.find({
      $or: [
        // Match Name or Description
        { name: { $regex: searchTerms.join("|"), $options: "i" } },
        { description: { $regex: searchTerms.join("|"), $options: "i" } },
        // Also check if occupation array matches any keyword (e.g. "Farmer")
        { occupation: { $in: searchTerms.map((t: string) => new RegExp(t, "i")) } }
      ]
    }).limit(5);

    return NextResponse.json(schemes);

  } catch (error) {
    console.error("Smart Search Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}