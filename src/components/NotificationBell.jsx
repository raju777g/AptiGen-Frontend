import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const { personal, platform, unreadCount, fetchAll, markRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("personal");
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click/tap — covers both mouse and touch devices,
  // and listens on the capture phase so it reliably fires before any
  // other element's own click handler (e.g. a nav link underneath) runs.
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside, true);
    document.addEventListener("touchstart", handleOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside, true);
      document.removeEventListener("touchstart", handleOutside, true);
    };
  }, [open]);

  // Close automatically if the user navigates to a different page while it's open
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleToggle = () => {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) markRead();
  };

  const list = tab === "personal" ? personal : platform;

  return (
    <div className="relative" ref={ref}>
      <button className="btn btn-ghost btn-circle" onClick={handleToggle}>
        <div className="indicator">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="badge badge-xs badge-error indicator-item animate-pulse">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-80 bg-base-100 shadow-xl rounded-box border border-base-300 z-50">
          <div role="tablist" className="tabs tabs-boxed m-2">
            <a role="tab" className={`tab ${tab === "personal" ? "tab-active" : ""}`} onClick={() => setTab("personal")}>
              Personal
            </a>
            <a role="tab" className={`tab ${tab === "platform" ? "tab-active" : ""}`} onClick={() => setTab("platform")}>
              From Us
            </a>
          </div>

          <div className="max-h-80 overflow-y-auto px-2 pb-2">
            {list.length === 0 && (
              <p className="text-center text-sm text-base-content/50 py-6">Nothing here yet</p>
            )}
            {list.map((n) => (
              <div key={n.id} className="p-3 rounded-lg hover:bg-base-200 transition-colors">
                <p className="font-semibold text-sm">{n.title}</p>
                <p className="text-xs text-base-content/50">{n.message}</p>
                <p className="text-[10px] tetext-base-content/50 xt-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}