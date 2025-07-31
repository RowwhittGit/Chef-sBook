import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    const accessToken = useAuthStore.getState().accessToken;
    set({ loading: true, error: null });

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/notifications/sent/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Transform the sent notifications to match our format
      const transformed = response.data.results.map(notification => ({
        ...notification,
        sender: {
          username: "You",
          profile_picture: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        }
      }));

      set({ notifications: transformed, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: err.message || "Failed to fetch", loading: false });
    }
  },
}));

export default useNotificationStore;