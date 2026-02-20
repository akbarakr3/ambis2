import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  mobile: string;
  name: string;
  role: 'admin' | 'shopkeeper';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      
      login: async (mobile: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch('http://localhost:5000/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, password }),
            credentials: 'include',
          });
          
          if (!response.ok) throw new Error('Login failed');
          
          const data = await response.json();
          set({ user: data.user, token: data.token });
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        set({ user: null, token: null });
      },
      
      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
