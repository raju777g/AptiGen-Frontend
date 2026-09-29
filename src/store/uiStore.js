   import { create } from "zustand";

   export const useUiStore = create((set) => ({
     sidebarOpen: false,
     toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
     closeSidebar: () => set({ sidebarOpen: false }),
   }));