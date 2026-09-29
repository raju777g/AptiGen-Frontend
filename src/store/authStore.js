import { create } from "zustand";
import { api } from "../api/client";
import { compressImageIfNeeded } from "../utils/compressImage";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  checkIn: async () => {
    const { data } = await api.post("/auth/checkin");
    return data;
  },

  checkSession: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    const params = new URLSearchParams();
    // Mobile keyboards and autofill commonly add surrounding whitespace or
    // change the email casing. Registration stores normalized email values,
    // so normalize here as well before Spring Security looks the user up.
    params.append("username", email.trim().toLowerCase());
    params.append("password", password);
    await api.post("/auth/login", params);
    const { data } = await api.get("/auth/me");
    set({ user: data });
    return data;
  },

  register: async (name, email, password) => {
    // Referral program disabled for now; do not send referral data.
    await api.post("/auth/register", { name: name.trim(), email: email.trim().toLowerCase(), password });
  },

  verifyEmail: async (email, code) => {
    await api.post("/auth/verify", { email: email.trim().toLowerCase(), code: code.trim() });
  },

  resendVerificationCode: async (email) => {
    const { data } = await api.post("/auth/verification/resend", { email: email.trim().toLowerCase() });
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },

  setPredefinedAvatar: async (avatarKey) => {
    const { data } = await api.post("/users/me/avatar/predefined", { avatarKey });
    set((s) => ({ user: { ...s.user, avatarUrl: data.avatarUrl } }));
  },

  uploadAvatar: async (file) => {
    const uploadFile = await compressImageIfNeeded(file);
    const formData = new FormData();
    formData.append("file", uploadFile);
    const { data } = await api.post("/users/me/avatar/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    set((s) => ({ user: { ...s.user, avatarUrl: data.avatarUrl } }));
  },

}));
