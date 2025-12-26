import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();

    // 1. Prepare the Prompt
    const prompt = `
      You are an expert document analyzer for the Indian Government Scheme platform "Sahayak".
      Analyze the attached document image.
      
      Step 1: Check Readability
      - Is it blurry or unreadable? If YES, return "isBlurry": true.
      
      Step 2: Extract Details
      - Age: Calculate from DOB (Assume 2025).
      - Income: Number only (e.g. 150000).
      - Gender: Male/Female.
      - Caste: General/OBC/SC/ST.
      
      Return RAW JSON only. Structure:
      {
        "isBlurry": boolean,
        "blurReason": string | null,
        "data": {
          "age": string | null,
          "income": string | null,
          "gender": string | null,
          "caste": string | null
        }
      }
    `;

    // 2. Call Groq with the NEWEST Model ID
    // If this fails in the future, run the 'check-models.js' script I provided below.
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || 'image/jpeg'};base64,${image}`,
              },
            },
          ],
        },
      ],
      // LATEST WORKING MODEL (As of Late 2025/2026)
      model: "meta-llama/llama-4-scout-17b-16e-instruct", 
      
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    return NextResponse.json(JSON.parse(content));

  } catch (error: any) {
    console.error("Groq Analysis Failed:", error);
    
    // FAIL-SAFE: If the model is wrong, tell the user exactly what happened
    if (error?.error?.code === 'model_decommissioned') {
      return NextResponse.json({ 
        error: "AI Model Decommissioned. Please run 'node check-models.js' to get the new ID." 
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}