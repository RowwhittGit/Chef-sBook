import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,

      setTokens: ({ access, refresh }) => {
        set({ accessToken: access, refreshToken: refresh });
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage', // this is the key in localStorage
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
