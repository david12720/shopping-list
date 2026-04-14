const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineSecret } = require('firebase-functions/params');
const admin = require("firebase-admin");

admin.initializeApp();

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

/**
 * AI Shopping List Parser
 * Takes natural language Hebrew text and extracts items based on the user's catalog.
 */
exports.processShoppingRequest = onCall({ 
  secrets: [GEMINI_API_KEY],
  cors: true,
  region: 'us-central1',
  maxInstances: 10
}, async (request) => {
  // 1. Basic security check
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Please sign in first.");
  }

  const text = request.data.text;
  const catalogNames = request.data.catalogNames || [];

  if (!text) {
    throw new HttpsError("invalid-argument", "Text is required.");
  }

  try {
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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Safely extract usage metadata
    let usage = null;
    try {
      usage = result.usageMetadata || (result.response && result.response.usageMetadata);
    } catch (e) {
      console.warn("Metadata extraction failed:", e);
    }

    // Log cost asynchronously (don't wait for it to return response)
    if (usage && usage.promptTokenCount) {
      const inputCost = (usage.promptTokenCount / 1_000_000) * 0.10;
      const outputCost = ((usage.candidatesTokenCount || 0) / 1_000_000) * 0.40;
      const totalCost = inputCost + outputCost;

      admin.database().ref("/admin/ai_costs").push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        uid: request.auth.uid,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || usage.promptTokenCount,
        cost: totalCost,
        inputTextLength: text.length
      }).catch(err => console.error("Logging failed:", err));
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Error:", error);
    throw new HttpsError("internal", error.message || "AI processing failed");
  }
});
