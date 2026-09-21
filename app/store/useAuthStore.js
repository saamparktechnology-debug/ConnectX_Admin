import { create } from 'zustand';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  isLoggedIn: false,
  phone: '',
  otpSent: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        const res = await api.get('/auth/me');
        await AsyncStorage.setItem('user_data', JSON.stringify(res.data.data.user));
        set({ user: res.data.data.user, token, isLoggedIn: true, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem('user_token');
      set({ loading: false });
    }
  },

  sendOtp: async (phone) => {
    const res = await api.post('/auth/send-otp', { phone });
    set({ phone, otpSent: true });
    return res.data;
  },

  resendOtp: async (phone) => {
    const res = await api.post('/auth/resend-otp', { phone });
    return res.data;
  },

  verifyOtp: async (phone, otp) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    const { user, token } = res.data.data;
    await AsyncStorage.setItem('user_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isLoggedIn: true, otpSent: false });
    return user;
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data.data;
    await AsyncStorage.setItem('user_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
    return user;
  },

  register: async (data) => {
    const res = await api.post('/auth/register', data);
    const { user, token } = res.data.data;
    await AsyncStorage.setItem('user_token', token);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isLoggedIn: true });
    return user;
  },

  logout: async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    set({ user: null, token: null, isLoggedIn: false });
  },

  updateUser: (data) => {
    set((state) => {
      const updated = { ...state.user, ...data };
      AsyncStorage.setItem('user_data', JSON.stringify(updated));
      return { user: updated };
    });
  }
}));

export default useAuthStore;
