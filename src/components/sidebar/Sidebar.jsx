import React from 'react';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    chats, 
    activeChatId, 
    setActiveChat, 
    createNewChat, 
    deleteChat, 
    clearAllHistory 
  } = useChatStore();

  // Sort chats by updatedAt (most recent first)
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside className="sidebar-container">
      <button className="new-chat-btn" onClick={createNewChat}>
        <Plus size={20} className="plus-icon" /> New Chat
      </button>
      
      <div className="sidebar-history">
        <p className="history-label">Recent</p>
        <div className="history-list">
          {sortedChats.length > 0 ? (
            sortedChats.map((chat) => (
              <div 
                key={chat.id} 
                className={`history-item ${activeChatId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat.id)}
              >
                <MessageSquare size={16} className="history-item-icon" />
                <span className="chat-title" title={chat.title}>{chat.title}</span>
                <button 
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
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
        <button className="clear-btn" onClick={clearAllHistory}>
          <Trash2 size={16} />
          Clear All History
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
