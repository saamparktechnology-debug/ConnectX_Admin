import { create } from 'zustand';
import api from '../services/api';

const useDiscoverStore = create((set, get) => ({
  users: [],
  loading: false,
  currentIndex: 0,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/discover');
      set({ users: res.data.data.users, currentIndex: 0, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  swipe: async (action) => {
    const { users, currentIndex } = get();
    if (currentIndex >= users.length) return;
    const swipedUser = users[currentIndex];
    try {
      const res = await api.post('/discover/swipe', { swipedId: swipedUser.id, action });
      set({ currentIndex: currentIndex + 1 });
      return res.data.data;
    } catch (error) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  getCurrentUser: () => {
    const { users, currentIndex } = get();
    return users[currentIndex] || null;
  },

  reset: () => set({ users: [], currentIndex: 0 })
}));

export default useDiscoverStore;
