   import { useThemeStore } from "../store/themeStore";

   export default function ThemeToggle({ inline = false }) {
     const { theme, toggleTheme } = useThemeStore();
     const isDark = theme === "dark";

     return (
       <button
         onClick={toggleTheme}
         className={inline ? "btn btn-ghost relative w-full justify-start gap-3 rounded-lg px-3" : "btn btn-ghost btn-circle relative overflow-hidden"}
         aria-label="Toggle theme"
       >
         <span
           className={`text-xl transition-all duration-300 ${isDark ? "rotate-0 opacity-100" : "rotate-90 opacity-0 absolute"}`}
         >
           🌙
         </span>
        <span
          className={`text-xl transition-all duration-300 ${!isDark ? "rotate-0 opacity-100" : "-rotate-90 opacity-0 absolute"}`}
        >
          ☀️
        </span>
        {inline && <span className="text-sm font-medium">Toggle theme</span>}
       </button>
     );
   }
