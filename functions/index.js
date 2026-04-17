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

  const uid = request.auth.uid;

  // Check if user is over their monthly limit
  const limitSnap = await admin.database().ref(`/admin/limits/${uid}`).once("value");
  const limitData = limitSnap.val();
  
  if (limitData && limitData.maxCostPerMonth > 0) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Sum costs for this month
    const costsSnap = await admin.database().ref("/admin/ai_costs")
      .orderByChild("uid").equalTo(uid).once("value");
    
    const costs = costsSnap.val() || {};
    let monthCost = 0;
    Object.values(costs).forEach(c => {
      const d = new Date(c.timestamp);
      if (`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === currentMonth) {
        monthCost += (c.cost || 0);
      }
    });

    if (monthCost >= limitData.maxCostPerMonth) {
      throw new HttpsError("resource-exhausted", "הגעת למגבלת השימוש החודשית שלך ב-AI.");
    }
  }

  const { text, fileData, context, mode } = request.data;
  const catalogNames = (context && context.catalogNames) || [];
  const categories = (context && context.categories) || [];
  const isRecipeMode = mode === 'recipe';

  if (!text && !fileData) {
    throw new HttpsError("invalid-argument", "Text or image is required.");
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    
    // Use 2.5 Pro for images OR recipe mode, 2.5 Flash Lite for simple text
    const modelName = (fileData || isRecipeMode) ? "gemini-2.5-pro" : "gemini-2.5-flash-lite";
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt;
    if (isRecipeMode) {
      prompt = `
        You are a helpful culinary assistant. 
        The user wants to prepare: "${text}".
        Suggest a list of standard grocery store ingredients needed for this dish.
        
        Rules for ingredients:
        1. Match names to these existing catalog names if possible: ${catalogNames.join(", ")}
        2. For each item, guess the most appropriate category from this list: ${categories.join(", ")}
        3. Determine if the unit is "units" or "kg".
        4. Amounts should be numbers.
        
        Response format MUST be:
        {
          "items": [
            { "name": "string", "amount": number, "unit": "kg" | "units", "category": "string" }
          ]
        }
      `;
    } else {
      prompt = `
        Analyze this shopping request in Hebrew. 
        Input might be text: "${text || "Extract from image"}"
        ${fileData ? "Input also includes an image/photo of a list or recipe." : ""}

        Extract all shopping items into a JSON array.
        
        Rules:
        1. Match item names to these existing catalog names if possible: ${catalogNames.join(", ")}
        2. For each item, guess the most appropriate category from this list: ${categories.join(", ")}
        3. If an item isn't in the catalog, provide its name and best category.
        4. Determine if the unit is "units" or "kg" (default to "units" if unclear).
        5. Amounts should be numbers.
        
        Response format MUST be:
        {
          "items": [
            { "name": "string", "amount": number, "unit": "kg" | "units", "category": "string" }
          ]
        }
      `;
    }

    let result;
    if (fileData) {
      // Multimodal: text + image
      const imagePart = {
        inlineData: {
          data: fileData.split(',')[1], // Remove "data:image/png;base64," prefix
          mimeType: "image/jpeg" // Gemini handles most image types as parts
        }
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      // Text only
      result = await model.generateContent(prompt);
    }

    const responseText = result.response.text();
    
    // Log cost asynchronously
    const usage = result.response.usageMetadata;
    if (usage) {
      // Different rates for different models (Gemini 2.5 Pro vs Flash Lite)
      const isPro = modelName.includes("2.5-pro");
      const inRate = isPro ? 1.25 : 0.10; // $1.25/1M vs $0.1/1M
      const outRate = isPro ? 10.00 : 0.40; // $10.00/1M vs $0.4/1M

      const inputCost = (usage.promptTokenCount / 1_000_000) * inRate;
      const outputCost = (usage.candidatesTokenCount / 1_000_000) * outRate;
      
      admin.database().ref("/admin/ai_costs").push({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        uid: request.auth.uid,
        model: modelName,
        inputTokens: usage.promptTokenCount,
        outputTokens: usage.candidatesTokenCount,
        cost: inputCost + outputCost,
        isImage: !!fileData || isRecipeMode
      }).catch(err => console.error("Logging failed:", err));
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Error:", error);
    throw new HttpsError("internal", error.message || "AI processing failed");
  }
});
