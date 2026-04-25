import React from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import './Sidebar.css';

const Sidebar = () => {
  const { messages, clearHistory } = useChatStore();

  // Filter only user messages to show as chat titles
  const chatHistory = messages
    .filter(msg => msg.role === 'user')
    .slice(-10) // Show last 10 interactions
    .reverse();

  return (
    <aside className="sidebar-container">
      <button className="new-chat-btn" onClick={clearHistory}>
        <Plus size={20} className="plus-icon" /> New Chat
      </button>
      
      <div className="sidebar-history">
        <p className="history-label">Recent</p>
        <div className="history-list">
          {chatHistory.length > 0 ? (
            chatHistory.map((msg) => (
              <div key={msg.id} className="history-item" title={msg.content}>
                <MessageSquare size={16} className="history-item-icon" />
                <span>{msg.content}</span>
              </div>
            ))
          ) : (
            <p style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              No history yet
            </p>
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="clear-btn" onClick={clearHistory}>
          <Trash2 size={16} />
          Clear History
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
