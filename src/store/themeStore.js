   import { create } from "zustand";

   const getInitialTheme = () => {
     const saved = localStorage.getItem("aptigen-theme");
     if (saved) return saved;
     return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "aptigen";
   };

   export const useThemeStore = create((set, get) => ({
     theme: getInitialTheme(),

     toggleTheme: () => {
       const next = get().theme === "aptigen" ? "dark" : "aptigen";
       localStorage.setItem("aptigen-theme", next);
       document.documentElement.setAttribute("data-theme", next);
       set({ theme: next });
     },

     applyStoredTheme: () => {
       document.documentElement.setAttribute("data-theme", get().theme);
     },
   }));