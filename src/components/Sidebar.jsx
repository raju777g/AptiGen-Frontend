import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useUiStore } from "../store/uiStore";
import logoMark from "../assets/logo-mark.png";
import MotivationalQuoteModal, { MOTIVATIONAL_QUOTES } from "./MotivationalQuoteModal";
import iconDashboard from "../assets/icon-dashboard.png"; // add this one if you have a dashboard-specific icon, else reuse an existing one
import iconGenerate from "../assets/icon-generate.png";
import iconMyTests from "../assets/icon-mytests.png"; // same — add or reuse
import iconPractice from "../assets/icon-practice.png";
import iconContests from "../assets/icon-contests.png";
import iconSkillRadar from "../assets/icon-skillradar.png";
// import iconRefer from "../assets/icon-refer.png";
import iconCoins from "../assets/icon-coins.png";
import iconContactUs from "../assets/contactUs.png";

const navItems = [
  { to: "/dashboard", icon: iconDashboard, label: "Dashboard" },
  { to: "/generate", icon: iconGenerate, label: "Generate Test" },
  { to: "/my-tests", icon: iconMyTests, label: "My Tests" },
  { to: "/practice", icon: iconPractice, label: "Practice Others" },
  { to: "/contests", icon: iconContests, label: "Contests" },
  { to: "/skill-radar", icon: iconSkillRadar, label: "Skill Radar" },
  // Referral program disabled for now.
  // { to: "/referral", icon: iconRefer, label: "Invite Friends" },
  { to: "/buy-coins", icon: iconCoins, label: "Buy Coins" },
  { to: "/contact-us", icon: iconContactUs, label: "Contact Us" },
];

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useUiStore();
  const [quoteIndex, setQuoteIndex] = useState(-1);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [proToast, setProToast] = useState(false);
  const advanceQuote = () => setQuoteIndex((index) => Math.floor(Math.random() * 31));

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <aside
        className={`app-sidebar fixed lg:sticky top-0 left-0 z-50 flex flex-col w-64 lg:w-60 shrink-0 h-screen border-r border-base-300 bg-base-100 px-4 py-6 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <button type="button" className="app-sidebar-brand" onClick={() => { advanceQuote(); setQuoteOpen(true); }} aria-label="Open a motivational quote">
          <img src={logoMark} alt="" />
          <span>Apti<span>Gen</span></span>
        </button>
        <nav className="app-sidebar-nav flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `app-sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-primary text-primary-content"
                  : "text-base-content/70 hover:bg-base-200"
                }`
              }
            >
              <img src={item.icon} alt="" className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="app-sidebar-upgrade rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #18245a, #171641)" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">👑</span>
              <span className="font-hero font-semibold text-sm">Pro Student</span>
            </div>
            <p className="text-xs text-white/70 mb-3">Unlock premium features</p>
            <button type="button" onClick={() => { setProToast(true); window.setTimeout(() => setProToast(false), 3600); }} className="btn btn-sm w-full bg-white text-indigo-700 border-none hover:bg-white/90">
              Go Pro →
            </button>
          </div>
        </div>
      </aside>
      {proToast && <div role="status" className="pro-coming-soon-toast fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-2xl border border-violet-400/50 bg-slate-950/95 px-5 py-4 text-center text-sm font-semibold text-white shadow-[0_0_40px_rgba(139,92,246,.4)]">Smart students think ahead &amp; choose better plan. This service is coming soon.</div>}
      <MotivationalQuoteModal open={quoteOpen} quoteIndex={quoteIndex} onClose={() => setQuoteOpen(false)} onNext={advanceQuote} />
    </>
  );
}
