import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  matches: [],
  currentMessages: [],
  unreadCount: 0,
  loading: false,

  fetchMatches: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/discover/matches');
      set({ matches: res.data.data.matches, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  fetchMessages: async (matchId) => {
    try {
      const res = await api.get(`/chat/messages/${matchId}`);
      set({ currentMessages: res.data.data.messages });
      return res.data.data.messages;
    } catch (error) {
      return [];
    }
  },

  sendMessage: async (matchId, text) => {
    try {
      await api.post(`/chat/send/${matchId}`, { message_text: text });
    } catch (error) {
      console.error('Send message error:', error);
    }
  },

  addMessage: (message) => {
    set((state) => ({
      currentMessages: [...state.currentMessages, message]
    }));
  },

  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/chat/unread');
      set({ unreadCount: res.data.data.unreadCount });
    } catch (error) {}
  }
}));

export default useChatStore;
