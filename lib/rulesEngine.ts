import { IScheme } from "@/models/Scheme";

// Define what a User Profile looks like in our app
export interface UserProfile {
  age: number;
  income: number;
  gender: string;      // "Male", "Female", "Other"
  caste: string;       // "General", "SC", "ST", "OBC"
  state: string;       // "MP", "UP", "Delhi", etc.
  occupation: string;  // "Farmer", "Student", "Unemployed"
}

export interface EligibilityResult {
  scheme_id: string;
  scheme_name: string;
  // NEW FIELDS ADDED HERE:
  description: string;
  benefits: string[];
  // ---------------------
  eligible: boolean;
  reasons: string[];
  missing_docs: string[];
}

/**
 * THE JUDGE: Pure function to check one user against one scheme.
 * Returns detailed trace of why they failed or passed.
 */
export function checkEligibility(user: UserProfile, scheme: IScheme): EligibilityResult {
  const rules = scheme.rules;
  const reasons: string[] = [];
  let isEligible = true;

  // 1. Age Check
  if (user.age < rules.age_min || user.age > rules.age_max) {
    isEligible = false;
    reasons.push(`Age mismatch: Required ${rules.age_min}-${rules.age_max}, Your age is ${user.age}`);
  }

  // 2. Income Check (If scheme has a limit)
  if (rules.income_max > 0 && user.income > rules.income_max) {
    isEligible = false;
    reasons.push(`Income too high: Max allowed ₹${rules.income_max}, Your income is ₹${user.income}`);
  }

  // 3. Gender Check
  if (rules.gender !== "All" && rules.gender !== user.gender) {
    isEligible = false;
    reasons.push(`Gender mismatch: Scheme is for ${rules.gender} only.`);
  }

  // 4. Caste Check (Array logic)
  // If scheme says ["All"], everyone passes. If scheme says ["SC", "ST"], only they pass.
  if (!rules.caste.includes("All") && !rules.caste.includes(user.caste)) {
    isEligible = false;
    reasons.push(`Caste mismatch: Scheme is for ${rules.caste.join("/")}, You are ${user.caste}`);
  }

  // 5. State Check
  if (!rules.state.includes("All") && !rules.state.includes(user.state)) {
    isEligible = false;
    reasons.push(`State mismatch: Scheme is for ${rules.state.join("/")}, You are from ${user.state}`);
  }

  // 6. Occupation Check
  if (!rules.occupation.includes("All") && !rules.occupation.includes(user.occupation)) {
    isEligible = false;
    reasons.push(`Occupation mismatch: Scheme is for ${rules.occupation.join("/")}, You are ${user.occupation}`);
  }

  // Final Verdict
  if (isEligible) {
    reasons.push("✅ All criteria matched perfectly.");
  }

  return {
    scheme_id: scheme._id as string,
    scheme_name: scheme.name,
    // PASS DATA FROM DB TO FRONTEND:
    description: scheme.description, 
    benefits: scheme.benefits || [], // Assuming your Scheme model has this
    // ----------------------------
    eligible: isEligible,
    reasons: reasons,
    missing_docs: isEligible ? scheme.required_docs : []
  };
}