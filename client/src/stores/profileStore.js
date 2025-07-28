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

      // Fetch Profile
      fetchProfile: async () => {
        const token = useAuthStore.getState().accessToken;
        console.log('[fetchProfile] Access Token:', token);

        if (!token) {
          set({ error: 'No access token found.', loading: false });
          return;
        }

        set({ loading: true, error: null });

        try {
          const res = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('[fetchProfile] Profile data fetched:', res.data);
          set({ user: res.data, loading: false });
        } catch (err) {
          let errorMsg = 'Failed to fetch profile.';
          console.error('[fetchProfile] Error object:', err);

          if (err.response) {
            console.error('[fetchProfile] Error response:', err.response);
            if (err.response.status === 401 || err.response.status === 403) {
              errorMsg = 'Session expired or unauthorized. Please log in again.';
              useAuthStore.getState().setTokens({ access: null, refresh: null });
              set({ user: null });
            } else if (err.response.data && err.response.data.detail) {
              errorMsg = err.response.data.detail;
            }
          } else if (err.message) {
            errorMsg = err.message;
          }

          set({ error: errorMsg, loading: false });
        }
      },

      // Update Profile
      updateProfile: async (formData) => {
        const token = useAuthStore.getState().accessToken;
        const user = get().user;

        console.log('[updateProfile] Access Token:', token);
        console.log('[updateProfile] Current User:', user);

        if (!token) {
          set({ error: 'No access token found.' });
          return;
        }

        if (!user) {
          set({ error: 'User not found. Please log in again.' });
          return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            data.append(key, value);
          }
        });

        console.log('[updateProfile] Form Data being sent:', Array.from(data.entries()));

        try {
          const res = await axios.patch('http://127.0.0.1:8000/api/auth/me/update/', data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          console.log('[updateProfile] Update successful:', res.data);
          alert('Profile updated!');
          await get().fetchProfile(); // refetch updated profile
        } catch (err) {
          let errorMsg = 'Update failed!';
          console.error('[updateProfile] Error object:', err);

          if (err.response) {
            console.error('[updateProfile] Error response:', err.response);
            if (err.response.data && err.response.data.detail) {
              errorMsg = err.response.data.detail;
            } else {
              errorMsg = JSON.stringify(err.response.data);
            }
          } else if (err.message) {
            errorMsg = err.message;
          }

          alert(errorMsg);
        }
      },

      clearProfile: () => {
        console.log('[clearProfile] Clearing user state');
        set({ user: null, error: null });
      },
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ user: state.user }), // only persist user
    }
  )
);

export default useProfileStore;
