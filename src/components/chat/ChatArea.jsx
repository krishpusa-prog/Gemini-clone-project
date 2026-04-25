import React, { useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import MarkdownRenderer from '../common/MarkdownRenderer';
import './ChatArea.css';

const ChatArea = () => {
  const messages = useChatStore((state) => {
    const activeChat = state.chats.find((c) => c.id === state.activeChatId);
    return activeChat ? activeChat.messages : [];
  });
  const { isLoading, setLoading } = useChatStore();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleRegenerate = () => {
    if (isLoading) return;
    setLoading(true);
    // Simulate regeneration delay
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
              <div key={msg.id} className="message-item">
                <div 
                  className="avatar" 
                  style={{ backgroundColor: msg.role === 'user' ? '#3b82f6' : '#22c55e' }} 
                />
                <div className="message-content">
                  {msg.role === 'user' ? msg.content : <MarkdownRenderer content={msg.content} />}
                  
                  {isLastModelMessage && !isLoading && (
                    <button 
                      onClick={handleRegenerate}
                      style={{ 
                        marginTop: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: 'transparent', 
                        border: '1px solid #444', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        color: '#a0a0a0', 
                        cursor: 'pointer', 
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#666'; }}
                      onMouseOut={(e) => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.borderColor = '#444'; }}
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
