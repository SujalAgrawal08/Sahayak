import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import { createWorker } from 'tesseract.js'; // 1. Import createWorker
import PDFParser from 'pdf2json';
import path from 'path';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: Standard PDF Text Extractor
async function parsePDFText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
    pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('type') as string;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    console.log(`📂 Processing ${docType} Document:`, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    // 1. EXTRACTION PIPELINE
    if (file.type === 'application/pdf') {
      try {
        extractedText = await parsePDFText(buffer);
        
        if (extractedText.trim().length < 50) {
           console.log("⚠️ Scanned PDF detected (No text layer).");
           return NextResponse.json({ 
             error: "SCANNED_PDF", 
             message: "This PDF appears to be a scanned image. Please upload a JPG/PNG photo of it instead." 
           }, { status: 422 });
        }
      } catch (pdfError) {
        console.error("PDF Fail:", pdfError);
        return NextResponse.json({ error: "PDF processing failed." }, { status: 500 });
      }
    } else if (file.type.startsWith('image/')) {
      try {
        // 2. TESSERACT SERVERLESS FIX (CDN LOADING)
        console.log("🖼️ Starting OCR with CDN binaries...");
        
        const worker = await createWorker('eng', 1, {
          cachePath: path.join('/tmp'), // <--- CRITICAL: Vercel only allows writing here
          logger: m => console.log(m)
        });

        const { data: { text } } = await worker.recognize(buffer);
        extractedText = text;
        
        await worker.terminate(); // Clean up memory
        
      } catch (ocrError: any) {
        console.error("OCR Failed:", ocrError);
        return NextResponse.json({ error: "OCR extraction failed. Try a clearer image." }, { status: 500 });
      }
    }

    // Cleanup Text
    try { extractedText = decodeURIComponent(extractedText); } catch(e) {}
    extractedText = extractedText.replace(/\s+/g, ' ').trim();
    
    // 2. INTELLIGENCE (LLM)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    let systemPrompt = "";

    if (docType === "CASTE") {
      systemPrompt = `
        You are an Expert Document Analyzer.
        TASK: Extract ONLY the Social Category (Caste).
        
        RULES:
        1. "Scheduled Caste", "SC", "Harijan" -> Return 'SC'.
        2. "Scheduled Tribe", "ST", "Adivasi" -> Return 'ST'.
        3. "OBC", "Backward Class" -> Return 'OBC'.
        4. "General", "Unreserved" -> Return 'General'.
        5. Default: 'General'.

        RETURN JSON ONLY: { "caste": "General" | "OBC" | "SC" | "ST" }
      `;
    } else {
      systemPrompt = `
        You are an Expert Document Analyzer.
        TODAY'S DATE: ${dateString}
        TASK: Extract Income, Age, Gender, State, Occupation.

        CRITICAL OCCUPATION MAPPING:
        1. "Student" (School, College, Class)
        2. "Farmer" (Agriculture, Cultivation)
        3. "Business" (Shop, Trade)
        4. "Unemployed" (Pensioner, Retired, Housewife, Service, None)
        
        RULES:
        1. 💰 INCOME: Look for "Annual Income", "Rs.". Words to Numbers. Default: 50000.
        2. ⚧ GENDER: "Son of"->Male, "Daughter of"->Female. Default: Male.
        3. 🌏 STATE: Header/District. Default: India.
        4. 🎂 AGE: Calc from DOB. Default: 21.

        RETURN JSON ONLY:
        {
          "age": number,
          "income": number,
          "gender": "Male" | "Female",
          "state": string,
          "occupation": "Student" | "Farmer" | "Business" | "Unemployed"
        }
      `;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: extractedText.substring(0, 4000) }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const structuredData = JSON.parse(completion.choices[0]?.message?.content || "{}");
    console.log(`✅ ${docType} Data Extracted:`, structuredData);

    return NextResponse.json(structuredData);

  } catch (error: any) {
    console.error("Netra Error:", error);
    return NextResponse.json({ error: "Server processing failed" }, { status: 500 });
  }
}