import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: (user) => set({ user, isAuthenticated: true, error: null }),
  logout: () => set({ user: null, isAuthenticated: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));

export default useAuthStore;