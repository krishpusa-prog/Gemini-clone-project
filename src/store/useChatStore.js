import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Stable empty reference to prevent infinite re-render loops in selectors
export const EMPTY_MESSAGES = [];

const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [], // Array of { id, title, messages, updatedAt }
      activeChatId: null,
      isLoading: false,
      error: null,

      // Actions
      setActiveChat: (id) => set({ activeChatId: id }),

      addMessage: (message) =>
        set((state) => {
          let currentId = state.activeChatId;
          let updatedChats = [...state.chats];

          // If no active chat, create one
          if (!currentId) {
            currentId = Date.now().toString();
            updatedChats.push({
              id: currentId,
              title: message.role === 'user' ? message.content.slice(0, 40) : 'New Chat',
              messages: [],
              updatedAt: Date.now(),
            });
          }

          const chatIndex = updatedChats.findIndex((c) => c.id === currentId);
          if (chatIndex === -1) return state;

          const chat = updatedChats[chatIndex];
          const newMessages = [...chat.messages, { ...message, id: Date.now() }];

          // Update title if it's the first message
          let newTitle = chat.title;
          if (chat.messages.length === 0 && message.role === 'user') {
            newTitle = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
          }

          updatedChats[chatIndex] = {
            ...chat,
            title: newTitle,
            messages: newMessages,
            updatedAt: Date.now(),
          };

          return {
            chats: updatedChats,
            activeChatId: currentId,
          };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error: error }),

      createNewChat: () => set({ activeChatId: null }),

      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        })),

      renameChat: (id, newTitle) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, title: newTitle } : c
          ),
        })),

      clearAllHistory: () => set({ chats: [], activeChatId: null }),
    }),
    {
      name: 'gemini-chat-history',
    }
  )
);

export default useChatStore;
