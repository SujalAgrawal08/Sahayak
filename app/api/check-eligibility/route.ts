import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Scheme from '@/models/Scheme';
import { checkEligibility, UserProfile } from '@/lib/rulesEngine';

export async function POST(req: Request) {
  try {
    const userProfile: UserProfile = await req.json();

    await dbConnect();

    // 1. Fetch ALL schemes from DB
    // Optimization: We only fetch the 'rules' field to make it fast
    const allSchemes = await Scheme.find({});

    // 2. Run the Rule Engine
    const results = allSchemes.map((scheme) => 
      checkEligibility(userProfile, scheme)
    );

    // 3. Separate Winners and Losers
    const eligibleSchemes = results.filter(r => r.eligible);
    const ineligibleSchemes = results.filter(r => !r.eligible);

    return NextResponse.json({
      summary: `Found ${eligibleSchemes.length} schemes for you.`,
      eligible: eligibleSchemes,
      ineligible_preview: ineligibleSchemes.map(s => ({ name: s.scheme_name, reason: s.reasons[0] })) // Just showing one reason
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}