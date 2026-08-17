import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  login: () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/github`;
  },

  getCurrentUser: async () => {
    try {
      const { data } = await api.get("/api/auth/me");

      set({
        user: data,
        loading: false,
      });
    } catch {
      set({
        user: null,
        loading: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");

      set({
        user: null,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
}));

export default useAuthStore;