import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not defined in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Sends a prompt to the Gemini model and returns the text response.
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<string>} - The AI's response text.
 */
export const runChat = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // For a simple single-turn chat:
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(error.message || "Failed to fetch response from Gemini");
  }
};

/**
 * Advanced: Start a multi-turn chat session
 * @param {Array} history - Array of previous messages [{role: 'user', parts: [{text: '...'}]}]
 * @returns {ChatSession}
 */
export const startNewChat = (history = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  return model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });
};
