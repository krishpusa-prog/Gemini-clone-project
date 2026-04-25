import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,

      // Actions
      addMessage: (message) => 
        set((state) => ({ 
          messages: [...state.messages, { ...message, id: Date.now() }] 
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error: error }),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: 'gemini-chat-history',
    }
  )
);

export default useChatStore;
