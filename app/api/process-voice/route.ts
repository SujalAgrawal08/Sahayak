import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    // UPDATED PROMPT: Strict Rules for Dropdown Matching
    const prompt = `
      You are a smart form-filling assistant.
      
      User Input: "${text}"
      
      Task: Extract profile details into JSON.
      
      CRITICAL RULES (Exact Spelling Required):
      1. Gender must be ONLY: "Male", "Female", or "Other".
      2. Caste must be ONLY: "General", "OBC", "SC", or "ST".
      3. Occupation must be ONLY: "Student", "Farmer", "Unemployed", or "Business".
      4. Age and Income must be numbers.
      
      If the user says something similar (e.g. "I study" or "college"), map it to the closest valid option (e.g. "Student").
      If user says "I have no job", map to "Unemployed".
      
      Return ONLY raw JSON. Example:
      {
        "age": 25,
        "income": 120000,
        "gender": "Male",
        "caste": "OBC",
        "occupation": "Farmer"
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // Use your working model ID from the previous step
      model: "meta-llama/llama-4-scout-17b-16e-instruct", 
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("AI returned empty response");

    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error("Voice Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}