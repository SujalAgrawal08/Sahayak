import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import mongoose from 'mongoose';
import { semanticSearch } from '@/lib/vectorSearch';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. SEMANTIC SEARCH: Replace keyword regex with embedding-based retrieval
    let relevantSchemes: any[] = [];
    
    if (process.env.MONGODB_URI) {
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGODB_URI);
        }
        
        // Use semantic search instead of keyword regex
        const searchResults = await semanticSearch(message, { topK: 3, minScore: 0.2 });
        relevantSchemes = searchResults.map(r => ({
          ...r.scheme,
          _relevanceScore: r.semanticScore,
        }));
        
        console.log(`[Chat RAG] Semantic search: ${relevantSchemes.length} schemes found (scores: ${searchResults.map(r => r.semanticScore.toFixed(3)).join(', ')})`);
      } catch (dbError) {
        console.warn("Semantic Search Failed, switching to LLM Knowledge:", dbError);
      }
    }

    // 2. CONTEXT PREP (Enriched with relevance scores)
    const contextText = relevantSchemes.map((s: any) => {
      const docs = Array.isArray(s.required_docs) ? s.required_docs.join(", ") : "Standard ID proofs";
      const rules = s.rules || {};
      
      return `
      - Scheme Name: ${s.name} (Relevance: ${((s._relevanceScore || 0) * 100).toFixed(0)}%)
        Description: ${s.description}
        Category: ${s.category || 'General'}
        Requirements: Age ${rules.age_min || 0}-${rules.age_max || 100}, Income < ₹${rules.income_max || 'No limit'}
        Documents: ${docs}
      `;
    }).join("\n\n");

    // 3. THE "FORMATTING-AWARE" SYSTEM PROMPT
    const systemPrompt = `
      You are "Sahayak Sarathi", an advanced AI assistant for the Government of India.
      
      **CONTEXT FROM DATABASE (Retrieved via Semantic Search):**
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
      sources: relevantSchemes.map(s => ({ name: s.name, score: s._relevanceScore })),
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return NextResponse.json({ 
      reply: "I am having trouble connecting to the server right now. Please try again in a moment.",
      sources: []
    });
  }
}