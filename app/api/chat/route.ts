import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import mongoose from 'mongoose';
import Scheme from '@/models/Scheme';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. RETRIEVAL
    const keywords = message.split(" ").filter((w: string) => w.length > 3);
    
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const relevantSchemes = await Scheme.find({
      $or: [
        { name: { $regex: keywords.join("|"), $options: "i" } },
        { description: { $regex: keywords.join("|"), $options: "i" } },
        { occupation: { $regex: keywords.join("|"), $options: "i" } }
      ]
    }).limit(3).select('name description benefits');

    // 2. AUGMENTATION
    const contextText = relevantSchemes.map((s: any) => {
      const benefitsList = Array.isArray(s.benefits) ? s.benefits.join(", ") : "See details.";
      return `- Scheme: ${s.name}\n  Details: ${s.description}\n  Benefits: ${benefitsList}`;
    }).join("\n\n");

    const systemPrompt = `
      You are 'Sahayak Sarathi', an AI expert on Indian Government Schemes.
      
      CONTEXT FROM DATABASE:
      ${contextText || "No specific schemes found for this query. Provide general advice."}

      USER QUERY: "${message}"

      INSTRUCTIONS:
      1. Answer strictly based on the Context provided.
      2. If the Context contains the answer, mention the scheme name.
      3. If no relevant context is found, politely say you don't have that specific info but offer general guidance.
      4. Keep answers concise (under 100 words).
    `;

    // --- FIX STARTS HERE ---
    // Sanitize history: Remove 'sources' or any other custom fields before sending to Groq
    const cleanHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));
    // --- FIX ENDS HERE ---

    // 3. GENERATION
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...cleanHistory, // Use the sanitized history
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    return NextResponse.json({ 
      reply: chatCompletion.choices[0]?.message?.content,
      sources: relevantSchemes 
    });

  } catch (error: any) {
    console.error("RAG Error:", error);
    return NextResponse.json({ 
      reply: "I am currently experiencing high traffic. Please try asking again in a moment.",
      sources: []
    });
  }
}