import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import useAuthStore from './authStore';

const useProfileStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      fetchProfile: async () => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          set({ error: 'No access token found.', loading: false });
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          set({ user: res.data, loading: false });
        } catch (err) {
          console.error('Fetch profile failed:', err);
          set({ error: 'Failed to fetch profile.', loading: false });
        }
      },

      updateProfile: async (formData) => {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          set({ error: 'No access token found.' });
          return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            data.append(key, value);
          }
        });

        try {
          await axios.patch('http://127.0.0.1:8000/api/auth/profile/update/', data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          alert('Profile updated!');
          await get().fetchProfile(); // refetch updated profile
        } catch (err) {
          console.error('Update profile failed:', err);
          alert('Update failed!');
        }
      },

      clearProfile: () => set({ user: null, error: null }),
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);

export default useProfileStore;
