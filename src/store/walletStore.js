import { create } from "zustand";
import { api } from "../api/client";

export const useWalletStore = create((set) => ({
  balance: null,
  transactions: [],

  fetchWallet: async () => {
    const { data } = await api.get("/wallet");
    let transactions = Array.isArray(data.transactions) ? data.transactions : [];
    if (!transactions.length) {
      try {
        const ledger = await api.get("/wallet/transactions");
        const payload = ledger.data;
        transactions = Array.isArray(payload) ? payload : (payload.content || payload.transactions || []);
      } catch {
        // Older backend builds expose only the wallet balance.
      }
    }
    set({ balance: data.balance, transactions });
    return data.balance;
  },

  createOrder: async (amountInr) => {
    const { data } = await api.post("/payments/create-order", { amountInr });
    return data;
  },
}));
