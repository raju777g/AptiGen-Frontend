   import { create } from "zustand";
   import { api } from "../api/client";
   import { compressImageIfNeeded } from "../utils/compressImage";

   export const useSupportStore = create((set, get) => ({
     chats: [],
     activeChat: null,
     messages: [],

     fetchChats: async () => {
       const { data } = await api.get("/support/chats");
       set({ chats: Array.isArray(data) ? data : [] });
     },

     startChat: async (subject, message) => {
       const { data } = await api.post("/support/chats", { subject, message });
       set({ activeChat: data });
       await get().fetchMessages(data.id);
       return data;
     },

     openChat: async (chat) => {
       set({ activeChat: chat });
       await get().fetchMessages(chat.id);
     },

     fetchMessages: async (chatId) => {
       const { data } = await api.get(`/support/chats/${chatId}/messages`);
       set({ messages: Array.isArray(data) ? data : [] });
     },

     sendMessage: async (chatId, text, file) => {
       const formData = new FormData();
       if (text) formData.append("message", text);
       if (file) formData.append("attachment", file.type.startsWith("image/") ? await compressImageIfNeeded(file) : file);
       await api.post(`/support/chats/${chatId}/messages`, formData, {
         headers: { "Content-Type": "multipart/form-data" },
       });
       await get().fetchMessages(chatId);
     },
   }));
