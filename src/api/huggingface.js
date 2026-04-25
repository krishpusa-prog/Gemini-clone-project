import { HfInference } from "@huggingface/inference";

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const hf = new HfInference(HF_TOKEN);

// Using Llama 3 - one of the most powerful open source models available for free
const MODEL_NAME = "meta-llama/Meta-Llama-3-8B-Instruct";

/**
 * Sends a prompt to Hugging Face Inference API
 */
export const runChat = async (prompt, imageData = null) => {
  if (!HF_TOKEN || HF_TOKEN === "your_huggingface_token_here") {
    throw new Error("Hugging Face Token is missing. Please add VITE_HUGGINGFACE_API_KEY to your .env file.");
  }

  try {
    // If there is an image, we should ideally use a vision model like llava
    // But since most serverless models are text-only, we'll focus on Llama 3 for now.
    // We can prepend a note if an image was provided but isn't being processed by the text model.
    let fullPrompt = prompt;
    if (imageData) {
      fullPrompt = `[User attached an image] ${prompt}`;
    }

    const response = await hf.chatCompletion({
      model: MODEL_NAME,
      messages: [
        { role: "user", content: fullPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;
    
    if (!text) {
      throw new Error("The model returned an empty response.");
    }
    
    return text;
  } catch (error) {
    console.error("Hugging Face API Error:", error);
    
    if (error.message.includes("401")) {
      return "Invalid Hugging Face Token. Please check your .env file.";
    }
    if (error.message.includes("loading")) {
      return "Model is currently loading on Hugging Face servers. Please try again in 30 seconds.";
    }
    
    return "Error: " + (error.message || "Could not connect to Hugging Face.");
  }
};
