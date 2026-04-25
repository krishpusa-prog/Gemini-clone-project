import React, { useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Volume2, Compass, Code, Edit3, Plane } from 'lucide-react';
import useChatStore, { EMPTY_MESSAGES } from '../../store/useChatStore';
import MarkdownRenderer from '../common/MarkdownRenderer';
import './ChatArea.css';

const SUGGESTED_PROMPTS = [
  { text: "Help me write a Python script for a simple web scraper", icon: <Code size={20} color="#4b90ff" /> },
  { text: "Plan a 3-day trip to Tokyo including hidden gems", icon: <Plane size={20} color="#ff5546" /> },
  { text: "Explain quantum physics like I'm 5 years old", icon: <Compass size={20} color="#fabd05" /> },
  { text: "Write a professional email asking for a job referral", icon: <Edit3 size={20} color="#34a853" /> },
];

const ChatArea = () => {
  const messages = useChatStore((state) => {
    const activeChat = state.chats.find((c) => c.id === state.activeChatId);
    return activeChat ? activeChat.messages : EMPTY_MESSAGES;
  });
  
  const isLoading = useChatStore((state) => state.isLoading);
  const setLoading = useChatStore((state) => state.setLoading);
  const setInputValue = useChatStore((state) => state.setInputValue);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSpeak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <h1 className="welcome-title">Hello, user</h1>
          <p className="welcome-subtitle">How can I help you today?</p>
          
          <div className="suggested-grid">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <div 
                key={i} 
                className="suggested-card"
                onClick={() => setInputValue(prompt.text)}
              >
                <p>{prompt.text}</p>
                <div className="card-icon">{prompt.icon}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((msg, index) => {
            const isLastModelMessage = msg.role !== 'user' && index === messages.findLastIndex(m => m.role !== 'user');
            
            return (
              <div key={msg.id} className={`message-item ${msg.role === 'error' ? 'error' : ''}`}>
                <div 
                  className={`avatar ${msg.role === 'error' ? 'error' : ''}`} 
                  style={{ backgroundColor: msg.role === 'user' ? '#3b82f6' : (msg.role === 'error' ? '#ef4444' : '#22c55e') }} 
                />
                <div className="message-content">
                  {msg.role === 'user' ? msg.content : <MarkdownRenderer content={msg.content} />}
                  
                  <div className="message-actions">
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => handleSpeak(msg.content)}
                        className="action-icon-btn"
                        title="Read aloud"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                    
                    {isLastModelMessage && !isLoading && (
                      <button 
                        onClick={handleRegenerate}
                        className="regenerate-btn"
                        title="Regenerate response"
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="message-item">
              <div className="avatar" style={{ backgroundColor: '#22c55e' }} />
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatArea;
