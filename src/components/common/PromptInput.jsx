import React, { useState } from 'react';
import useChatStore from '../../store/useChatStore';
import { runChat } from '../../api/gemini';
import './PromptInput.css';

const PromptInput = () => {
  const [input, setInput] = useState('');
  
  // Use atomic selectors for performance
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);
  const isLoading = useChatStore((state) => state.isLoading);

  const handleSend = async () => {
    const prompt = input.trim();
    // Prevent sending if empty or if already loading
    if (!prompt || isLoading) return;
    
    addMessage({ role: 'user', content: prompt });
    setInput('');
    setError(null);
    setLoading(true);
    
    try {
      const response = await runChat(prompt);
      addMessage({ role: 'model', content: response });
    } catch (err) {
      console.error("Chat Error:", err);
      
      let errorMessage = err.message;

      if (errorMessage.includes("Safety")) {
        errorMessage = "🛡️ Content Filter: " + errorMessage;
      } else if (errorMessage.includes("Rate limit")) {
        errorMessage = "⏳ Rate limit reached. The Free Tier of Gemini has a limit on how many messages you can send per minute. Please wait 60 seconds and try again.";
      }

      setError(errorMessage);
      addMessage({ 
        role: 'error', 
        content: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-wrapper">
      <div className="input-container" style={{ opacity: isLoading ? 0.7 : 1 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isLoading ? "Gemini is thinking..." : "Enter a prompt here"}
          className="prompt-field"
          disabled={isLoading}
        />
        <div className="input-actions">
          <button 
            className="action-btn" 
            title="Upload Image (Coming Soon)"
            disabled={isLoading}
          >
            📷
          </button>
          <button 
            className="action-btn" 
            title="Use Microphone (Coming Soon)"
            disabled={isLoading}
          >
            🎤
          </button>
          <button 
            onClick={handleSend}
            className="send-btn"
            title="Send Message"
            disabled={isLoading || !input.trim()}
            style={{ 
              color: (isLoading || !input.trim()) ? '#444' : 'var(--color-blue)',
              cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            ➤
          </button>
        </div>
      </div>
      <p className="input-disclaimer">
        Gemini may display inaccurate info, including about people, so double-check its responses. 
        <a href="#" className="disclaimer-link">Your privacy & Gemini Apps</a>
      </p>
    </div>
  );
};

export default PromptInput;
