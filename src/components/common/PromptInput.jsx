import React, { useState } from 'react';
import useChatStore from '../../store/useChatStore';
import { runChat } from '../../api/gemini';
import './PromptInput.css';

const PromptInput = () => {
  const [input, setInput] = useState('');
  const { addMessage, setLoading, setError } = useChatStore();

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    
    addMessage({ role: 'user', content: prompt });
    setInput('');
    setError(null);
    setLoading(true);
    
    try {
      const response = await runChat(prompt);
      addMessage({ role: 'model', content: response });
    } catch (err) {
      console.error("Chat Error:", err);
      
      // Determine error type for cleaner UI feedback
      let errorRole = 'error';
      let errorMessage = err.message;

      // Handle specific categories if needed
      if (errorMessage.includes("Safety")) {
        errorMessage = "🛡️ Content Filter: " + errorMessage;
      } else if (errorMessage.includes("Rate limit")) {
        errorMessage = "⏳ " + errorMessage;
      }

      setError(errorMessage);
      addMessage({ 
        role: errorRole, 
        content: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Enter a prompt here"
          className="prompt-field"
        />
        <div className="input-actions">
          <button className="action-btn" title="Upload Image (Coming Soon)">📷</button>
          <button className="action-btn" title="Use Microphone (Coming Soon)">🎤</button>
          <button 
            onClick={handleSend}
            className="send-btn"
            title="Send Message"
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
