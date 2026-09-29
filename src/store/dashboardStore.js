   import { create } from "zustand";
   import { api } from "../api/client";

   export const useDashboardStore = create((set) => ({
     stats: null,

     fetchStats: async () => {
       const { data } = await api.get("/analytics/dashboard-stats");
       set({ stats: data });
     },
   }));