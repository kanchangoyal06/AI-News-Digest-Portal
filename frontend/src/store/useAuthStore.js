import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  token: sessionStorage.getItem('token') || null,
  login: (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    set({ user: userData, token });
  },
  logout: () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
