import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Scheme from '@/models/Scheme';
import schemesData from '@/data/schemes.json';
import { getEmbedding } from '@/lib/embedding'; // Import our new AI tool

export async function POST() {
  try {
    await dbConnect();
    
    // 1. Delete Old Data
    await Scheme.deleteMany({});

    // 2. Add Embeddings to Data
    const schemesWithEmbeddings = await Promise.all(
      schemesData.map(async (s) => {
        // We embed the Name + Description + Category for best context
        const textToEmbed = `${s.name} ${s.description} ${s.category}`;
        const embedding = await getEmbedding(textToEmbed);
        
        return {
          ...s,
          description_embedding: embedding
        };
      })
    );

    // 3. Insert into DB
    await Scheme.insertMany(schemesWithEmbeddings);

    return NextResponse.json({ 
      message: 'Database seeded with AI Embeddings!', 
      count: schemesWithEmbeddings.length 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}