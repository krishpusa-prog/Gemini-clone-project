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
    
    // 1. Add user message to UI immediately
    addMessage({ role: 'user', content: prompt });
    setInput('');
    setError(null); // Clear previous errors
    
    // 2. Trigger loading state
    setLoading(true);
    
    try {
      // 3. Call real Gemini API
      const response = await runChat(prompt);
      
      // 4. Add AI response to UI
      addMessage({ role: 'model', content: response });
    } catch (err) {
      // 5. Handle errors gracefully
      console.error("Chat Error:", err);
      setError(err.message);
      addMessage({ 
        role: 'error', 
        content: `Sorry, I encountered an error: ${err.message}. Please check your API key and connection.` 
      });
    } finally {
      // 6. End loading state
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
