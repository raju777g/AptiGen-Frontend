    import { create } from "zustand";
    import { api } from "../api/client";

    export const useNotificationStore = create((set) => ({
      personal: [],
      platform: [],
      unreadCount: 0,

      fetchAll: async () => {
        const [personalRes, platformRes, countRes] = await Promise.all([
          api.get("/notifications/personal"),
          api.get("/notifications/platform"),
          api.get("/notifications/unread-count"),
        ]);
        set({
          personal: Array.isArray(personalRes.data) ? personalRes.data : [],
          platform: Array.isArray(platformRes.data) ? platformRes.data : [],
          unreadCount: Number(countRes.data) || 0,
        });
      },

      markRead: async () => {
        await api.post("/notifications/mark-read");
        set({ unreadCount: 0 });
      },
    }));
