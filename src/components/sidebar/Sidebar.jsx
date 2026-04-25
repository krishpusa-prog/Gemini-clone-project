import React, { useState } from 'react';
import { MessageSquare, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    chats, 
    activeChatId, 
    setActiveChat, 
    createNewChat, 
    deleteChat, 
    renameChat,
    clearAllHistory 
  } = useChatStore();

  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Sort chats by updatedAt (most recent first)
  const sortedChats = [...chats].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

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
                onClick={() => !editingChatId && setActiveChat(chat.id)}
              >
                <MessageSquare size={16} className="history-item-icon" />
                
                {editingChatId === chat.id ? (
                  <div className="edit-container">
                    <input
                      className="edit-input"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(e, chat.id);
                        if (e.key === 'Escape') handleCancelRename(e);
                      }}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button onClick={(e) => handleSaveRename(e, chat.id)}><Check size={14} /></button>
                      <button onClick={handleCancelRename}><X size={14} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="chat-title" title={chat.title}>{chat.title}</span>
                    <div className="item-actions">
                      <button 
                        className="item-action-btn"
                        onClick={(e) => handleStartRename(e, chat)}
                        title="Rename chat"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="item-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        title="Delete chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
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
