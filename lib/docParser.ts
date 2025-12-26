export interface ExtractedData {
  age: string;
  gender: string;
  income: string;
  caste: string;
}

/**
 * INTELLIGENT MERGE: Takes existing data + new OCR text -> Returns improved data
 */
export const parseAndMerge = (currentData: ExtractedData, text: string): ExtractedData => {
  const newData = { ...currentData };
  const lowerText = text.toLowerCase();

  // 1. AGE / DOB DETECTION (Prioritize if missing)
  if (!newData.age) {
    // Matches "DOB: 12/05/2000" or "Year of Birth: 1998"
    const dobMatch = text.match(/(?:DOB|Date of Birth)[\s:|-]*(\d{2})[\/-](\d{2})[\/-](\d{4})/i);
    const yearMatch = text.match(/(?:Year of Birth|YOB)[\s:|-]*(\d{4})/i);

    if (dobMatch) {
      const birthYear = parseInt(dobMatch[3]);
      newData.age = (new Date().getFullYear() - birthYear).toString();
    } else if (yearMatch) {
      const birthYear = parseInt(yearMatch[1]);
      newData.age = (new Date().getFullYear() - birthYear).toString();
    }
  }

  // 2. INCOME DETECTION (Update if missing or current is 0)
  // Logic: Income certificates usually say "Annual Income Rs X"
  if (!newData.income || newData.income === "0") {
    const incomeMatch = text.match(/(?:Annual Income|Income)[\s:|-]*(?:Rs\.?|INR)?\s*([0-9,]+)/i);
    if (incomeMatch) {
      newData.income = incomeMatch[1].replace(/,/g, "");
    }
  }

  // 3. GENDER DETECTION (Update if missing)
  if (!newData.gender || newData.gender === "Male") { // Default might be Male, so we check specifically
    if (lowerText.includes("female") || lowerText.includes("miss ") || lowerText.includes("smt")) {
      newData.gender = "Female";
    } else if (lowerText.includes("male") || lowerText.includes("mr ")) {
      newData.gender = "Male";
    }
  }

  // 4. CASTE DETECTION
  if (!newData.caste || newData.caste === "General") {
    if (lowerText.includes("obc")) newData.caste = "OBC";
    if (lowerText.includes("sc") || lowerText.includes("scheduled caste")) newData.caste = "SC";
    if (lowerText.includes("st") || lowerText.includes("scheduled tribe")) newData.caste = "ST";
  }

  return newData;
};