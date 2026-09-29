   import { create } from "zustand";
   import { api } from "../api/client";

   export const useContestStore = create((set) => ({
     liveContests: [],
     leaderboard: [],

     fetchLive: async () => {
       const { data } = await api.get("/contests/live");
       set({ liveContests: Array.isArray(data) ? data : [] });
     },

     enterContest: async (contestId) => {
       const { data } = await api.post(`/contests/${contestId}/enter`);
       return data;
     },

     startContestAttempt: async (contestId, testId) => {
       const { data } = await api.post(`/contests/${contestId}/start-attempt?testId=${testId}`);
       return data;
     },

     fetchLeaderboard: async (contestId) => {
       const { data } = await api.get(`/contests/${contestId}/leaderboard`);
       set({ leaderboard: Array.isArray(data) ? data : [] });
     },
   }));
