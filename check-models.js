// Run this with: node check-models.js
require('dotenv').config({ path: '.env.local' });
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  console.log("🔍 Checking available Groq models...");
  try {
    const list = await groq.models.list();
    console.log("\n✅ AVAILABLE MODELS:");
    list.data.forEach((model) => {
      // We only care about models that are NOT deprecated
      console.log(`- ${model.id} (Owner: ${model.owned_by})`);
    });
    console.log("\n👉 Use one of the IDs above in your route.ts file.");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();