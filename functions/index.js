const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Set global options to allow CORS from your specific domains
setGlobalOptions({ 
  region: 'us-central1',
  cors: ["https://david12720.github.io", "http://localhost:5000", "http://localhost:5500", "http://127.0.0.1:5500"]
});

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

/**
 * AI Shopping List Parser
 * Takes natural language Hebrew text and extracts items based on the user's catalog.
 */
exports.processShoppingRequest = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  // 1. Basic security check (only logged in users can use your AI credits)
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in first.");
  }

  const text = request.data.text;
  const catalogNames = request.data.catalogNames || [];

  if (!text) {
    throw new HttpsError("invalid-argument", "Text is required.");
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Analyze this shopping request in Hebrew: "${text}"
    Extract the items into a JSON array.
    
    Rules:
    1. Match item names to these existing catalog names if possible: ${catalogNames.join(", ")}
    2. If an item isn't in the list, use a natural Hebrew name.
    3. Determine if the amount is "units" or "kg" (default to "units" if unclear).
    4. Amounts should be numbers.
    
    Response format MUST be:
    {
      "items": [
        { "name": "string", "amount": number, "unit": "kg" | "units" }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const usage = result.usageMetadata || result.response.usageMetadata;

    // Log cost to /admin/ai_costs
    if (usage) {
      const inputCost = (usage.promptTokenCount / 1_000_000) * 0.10;
      const outputCost = (usage.candidatesTokenCount / 1_000_000) * 0.40;
      const totalCost = inputCost + outputCost;

      await admin.database().ref("/admin/ai_costs").push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        uid: request.auth.uid,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount,
        cost: totalCost,
        inputTextLength: text.length
      });
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI processing failed:", error);
    throw new HttpsError("internal", "Failed to process request with AI: " + error.message);
  }
});
