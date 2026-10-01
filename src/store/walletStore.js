import { create } from "zustand";
import { api } from "../api/client";

export const useWalletStore = create((set) => ({
  balance: null,

  fetchWallet: async () => {
    const { data } = await api.get("/wallet");
    set({ balance: data.balance });
    return data.balance;
  },

  createOrder: async (amountInr) => {
    const { data } = await api.post("/payments/create-order", { amountInr });
    return data;
  },
}));
