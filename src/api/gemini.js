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
  if (message.includes("not found") || message.includes("404")) {
    return "Model not found. We are trying to use gemini-2.0-flash. Please ensure your API key has access to this model.";
  }
  
  return message || "An unexpected error occurred while fetching the response.";
};

/**
 * Sends a prompt (and optional image) to the Gemini model.
 */
export const runChat = async (prompt, imageData = null) => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  try {
    // Switching to gemini-2.0-flash as it is the most stable multimodal model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let result;
    if (imageData) {
      const imagePart = {
        inlineData: {
          data: imageData.data,
          mimeType: imageData.mimeType,
        },
      };
      result = await model.generateContent([prompt, imagePart]);
    } else {
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    
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
