import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import mongoose from 'mongoose';
import Scheme from '@/models/Scheme';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. SEARCH: Keyword Matching
    const keywords = message.split(" ").filter((w: string) => w.length > 3);
    const regexQuery = keywords.join("|");

    let relevantSchemes: any[] = [];
    
    // Only attempt DB connection if we have a valid URI
    if (process.env.MONGODB_URI) {
      try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
        
        relevantSchemes = await Scheme.find({
          $or: [
            { name: { $regex: regexQuery, $options: "i" } },
            { description: { $regex: regexQuery, $options: "i" } },
            { occupation: { $in: [new RegExp(regexQuery, "i")] } }
          ]
        }).limit(3);
      } catch (dbError) {
        console.warn("Database Search Failed, switching to LLM Knowledge:", dbError);
      }
    }

    // 2. CONTEXT PREP
    const contextText = relevantSchemes.map((s: any) => {
      const ben = Array.isArray(s.benefits) ? s.benefits.join(", ") : "Various benefits";
      const docs = Array.isArray(s.required_docs) ? s.required_docs.join(", ") : "Standard ID proofs";
      
      return `
      - Scheme Name: ${s.name}
        Description: ${s.description}
        Benefits: ${ben}
        Requirements: Age ${s.age_min}-${s.age_max}, Income < ₹${s.income_max}
        Documents: ${docs}
      `;
    }).join("\n\n");

    // 3. THE "FORMATTING-AWARE" SYSTEM PROMPT
    const systemPrompt = `
      You are "Sahayak Sarathi", an advanced AI assistant for the Government of India.
      
      **CONTEXT FROM DATABASE:**
      ${contextText || "No local data found."}

      **CRITICAL INSTRUCTIONS:**
      1. **Check Context First:** If scheme details are in the context above, use them.
      2. **Fallback Strategy:** If context is empty, use your internal knowledge (Llama-3). DO NOT say "I don't know".
      
      **FORMATTING & STYLE GUIDELINES (STRICT):**
      1. **Markdown Only:** Use clear headings (###), **Bold** text for key terms, and bullet points.
      2. **Emoji Policy:** Use emojis *sparingly* and *relevantly*. 
         - Good usage: "💰 Benefits", "📝 Documents", "🎯 Objective".
         - Bad usage: "Hello 👋 friend 🌟 how are you 🌈".
         - Limit emojis to section headers only.
      3. **Structure:**
         - **Greeting:** Warm and culturally appropriate (Namaste/Sat Sri Akal).
         - **Introduction:** 1-2 lines summarizing the scheme.
         - **Key Details:** Use bullet points for Objective, Eligibility, Benefits.
         - **Closing:** Polite closing statement.
         - **Disclaimer:** If using internal knowledge, add: *"Here is the general information based on my knowledge base. Please verify with the official portal."*

      **TONE:**
      - Professional, Warm, Empathetic.
    `;

    // 4. SANITIZE HISTORY
    const cleanHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant', 
      content: msg.content
    }));

    // 5. GENERATE
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...cleanHistory,
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // Lower temperature ensures strict formatting adherence
      max_tokens: 1000,
    });

    return NextResponse.json({ 
      reply: chatCompletion.choices[0]?.message?.content,
      sources: relevantSchemes 
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ 
      reply: "I am having trouble connecting to the server right now. Please try again in a moment.",
      sources: []
    });
  }
}