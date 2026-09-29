import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWalletStore } from "../store/walletStore";
import { useUiStore } from "../store/uiStore";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import CheckInModal from "./CheckInModal";
import AvatarPickerModal from "./AvatarPickerModal";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { resolveAvatarSrc } from "../utils/avatarResolver";
import changePic from "../assets/avatars/change-pic.png";
import resetPass from "../assets/avatars/reset-pass.png";
import userLogout from "../assets/avatars/user-logout.png";
import logoMark from "../assets/logo-mark.png";
import MotivationalQuoteModal, { MOTIVATIONAL_QUOTES } from "./MotivationalQuoteModal";

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const checkIn = useAuthStore((s) => s.checkIn);
  const balance = useWalletStore((s) => s.balance);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const navigate = useNavigate();
  const location = useLocation();

  const [checkInResult, setCheckInResult] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchCount, setSearchMatchCount] = useState(0);
  const [searchIndex, setSearchIndex] = useState(0);
  const searchInputRef = useRef(null);
  const searchMatchesRef = useRef([]);

  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;
    root.querySelectorAll(".search-match, .search-match-active").forEach((node) => {
      node.classList.remove("search-match", "search-match-active");
    });
    const terms = searchQuery.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      searchMatchesRef.current = [];
      setSearchMatchCount(0);
      setSearchIndex(0);
      return;
    }
    const candidates = [...root.querySelectorAll("section, article, .card, [data-searchable], h1, h2, h3")];
    const matching = candidates.filter((node) => {
      if (!node.getClientRects().length) return false;
      const text = (node.innerText || node.textContent || "").toLocaleLowerCase();
      return terms.every((term) => text.includes(term));
    });
    const topLevelMatches = matching.filter((node) => !matching.some((other) => other !== node && other.contains(node)));
    topLevelMatches.forEach((node) => node.classList.add("search-match"));
    searchMatchesRef.current = topLevelMatches;
    setSearchMatchCount(topLevelMatches.length);
    setSearchIndex(0);
  }, [searchQuery, location.pathname]);

  useEffect(() => {
    searchMatchesRef.current.forEach((node) => node.classList.remove("search-match-active"));
    searchMatchesRef.current[searchIndex]?.classList.add("search-match-active");
  }, [searchIndex, searchMatchCount, searchQuery, location.pathname]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const moveSearch = (direction) => {
    if (!searchMatchesRef.current.length) return;
    const next = (searchIndex + direction + searchMatchesRef.current.length) % searchMatchesRef.current.length;
    setSearchIndex(next);
    searchMatchesRef.current[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      moveSearch(event.shiftKey ? -1 : 1);
    } else if (event.key === "Escape") {
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  const avatarSrc = resolveAvatarSrc(user?.avatarUrl);

  const handleCheckIn = async () => {
    const result = await checkIn();
    setCheckInResult(result);
    if (!result.alreadyCheckedIn) fetchWallet();
  };

  const handleConfirmLogout = async () => {
    await logout();
    setLogoutModalOpen(false);
    navigate("/login");
  };

  const handleLogoClick = () => {
    setQuoteIndex((index) => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
    setQuoteOpen(true);
  };

  return (
    <>
      <div className="app-topbar flex items-center justify-between gap-2 px-3 sm:px-6 py-3 border-b border-base-300 bg-base-100 sticky top-0 z-30">
        <div className="app-topbar-brand flex items-center gap-1 sm:gap-2 shrink-0">
          <button aria-label="Open navigation menu" className="app-menu-button btn btn-ghost btn-circle btn-sm sm:btn-md lg:hidden" onClick={toggleSidebar}>
            <span className="text-xl">☰</span>
          </button>
          <button type="button" className="app-brand app-topbar-logo flex items-center gap-1" onClick={handleLogoClick} aria-label="Show a motivational quote">
            <img src={logoMark} alt="" />
            <span>AptiGen</span>
          </button>
        </div>

        <div className="app-topbar-search hidden md:flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2 w-full max-w-xl mx-4">
          <span className="text-base-content/40">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for topics, tests, or anything..."
            className="bg-transparent outline-none text-sm w-full placeholder:text-base-content/40"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && <><span className={`whitespace-nowrap text-xs ${searchMatchCount ? "text-base-content/60" : "text-error"}`}>{searchMatchCount ? `${searchIndex + 1}/${searchMatchCount}` : "No matches"}</span><button type="button" className="rounded px-1 text-base-content/60 hover:bg-base-300 disabled:opacity-30" aria-label="Previous match" disabled={!searchMatchCount} onClick={() => moveSearch(-1)}>↑</button><button type="button" className="rounded px-1 text-base-content/60 hover:bg-base-300 disabled:opacity-30" aria-label="Next match" disabled={!searchMatchCount} onClick={() => moveSearch(1)}>↓</button><button type="button" className="rounded px-1 text-base-content/60 hover:bg-base-300" aria-label="Clear search" onClick={() => setSearchQuery("")}>×</button></>}
          <kbd className="kbd kbd-xs">Ctrl</kbd>
          <kbd className="kbd kbd-xs">K</kbd>
        </div>

        <div className="flex-1 hidden lg:block" />

        <div className="app-topbar-actions flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button className="app-checkin btn btn-sm btn-outline gap-1 px-2 sm:px-3" onClick={handleCheckIn}>
            🔥 <span className="hidden sm:inline">Check-In</span>
          </button>

          <div
            className="app-coin-balance badge badge-lg gap-1 font-medium"
            style={{ backgroundColor: "var(--amber)", color: "var(--ink)", border: "none" }}
          >
            🪙 {balance ?? "..."}
          </div>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <NotificationBell />

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="avatar cursor-pointer">
              <div className="app-topbar-avatar-frame w-9 h-9 rounded-full ring ring-primary/30">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" />
                ) : (
                  <div className="bg-neutral text-neutral-content w-9 h-9 flex items-center justify-center">
                    <span className="text-sm">{user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box shadow-lg w-56 mt-2 p-2 border border-base-300 z-40"
            >
              <li className="px-3 py-1 text-xs text-base-content/50 truncate">
                {user?.name || user?.email}
              </li>
              <li className="sm:hidden">
                <ThemeToggle inline />
              </li>
              <li>
                <button onClick={() => setAvatarModalOpen(true)}>
                  <img src={changePic} alt="" className="w-5 h-5 object-contain" />
                  <span>Change Profile Pic</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/change-password")}>
                  <img src={resetPass} alt="" className="w-5 h-5 object-contain" />
                  <span>Change Password</span>
                </button>
              </li>
              <li>
                <button className="text-error" onClick={() => setLogoutModalOpen(true)}>
                  <img src={userLogout} alt="" className="w-5 h-5 object-contain" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <CheckInModal result={checkInResult} onClose={() => setCheckInResult(null)} />
      <AvatarPickerModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} />
      <LogoutConfirmModal open={logoutModalOpen} onConfirm={handleConfirmLogout} onCancel={() => setLogoutModalOpen(false)} />
      <MotivationalQuoteModal open={quoteOpen} quoteIndex={quoteIndex} onClose={() => setQuoteOpen(false)} onNext={() => setQuoteIndex((index) => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length))} />
    </>
  );
}
