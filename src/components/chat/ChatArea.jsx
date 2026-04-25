import React, { useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import useChatStore, { EMPTY_MESSAGES } from '../../store/useChatStore';
import MarkdownRenderer from '../common/MarkdownRenderer';
import './ChatArea.css';

const ChatArea = () => {
  // Use a stable reference for messages to prevent infinite re-render loops
  const messages = useChatStore((state) => {
    const activeChat = state.chats.find((c) => c.id === state.activeChatId);
    return activeChat ? activeChat.messages : EMPTY_MESSAGES;
  });
  
  const isLoading = useChatStore((state) => state.isLoading);
  const setLoading = useChatStore((state) => state.setLoading);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

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
          <h1 className="welcome-title">
            Hello, user
          </h1>
          <p className="welcome-subtitle">How can I help you today?</p>
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
