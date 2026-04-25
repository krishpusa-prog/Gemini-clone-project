import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Categorizes and formats errors from the Gemini SDK
 */
const handleGeminiError = (error) => {
  const message = error.message || "";
  
  if (message.includes("API_KEY_INVALID")) {
    return "Invalid API Key. Please check your .env file and Google AI Studio settings.";
  }
  if (message.includes("SAFETY")) {
    return "This response was blocked due to safety filters. Try rephrasing your prompt.";
  }
  if (message.includes("quota") || message.includes("429")) {
    return "Rate limit exceeded. Please wait a moment before sending another message.";
  }
  
  return message || "An unexpected error occurred while fetching the response.";
};

/**
 * Sends a prompt to the Gemini model and returns the text response.
 */
export const runChat = async (prompt) => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Check if the response was blocked
    if (response.promptFeedback?.blockReason) {
      throw new Error(`SAFETY: Content blocked due to ${response.promptFeedback.blockReason}`);
    }

    const text = response.text();
    if (!text) {
      throw new Error("The model returned an empty response.");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    const friendlyMessage = handleGeminiError(error);
    throw new Error(friendlyMessage);
  }
};

export const startNewChat = (history = []) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  return model.startChat({
    history: history,
    generationConfig: { maxOutputTokens: 2000 },
  });
};
