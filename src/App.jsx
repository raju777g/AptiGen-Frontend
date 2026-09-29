import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useWalletStore } from "./store/walletStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GeneratePage from "./pages/GeneratePage";
import MyTestsPage from "./pages/MyTestsPage";
import TakeTestPage from "./pages/TakeTestPage";
import ResultsPage from "./pages/ResultsPage";
import PublicTestsPage from "./pages/PublicTestsPage";
import { useState } from "react";
import CheckInModal from "./components/CheckInModal";
// import ReferralPage from "./pages/ReferralPage";
import SkillRadarPage from "./pages/SkillRadarPage";
import BuyCoinsPage from "./pages/BuyCoinsPage";
import NotificationBell from "./components/NotificationBell";
import { useThemeStore } from "./store/themeStore";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ContestsPage from "./pages/ContestsPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ContactUsPage from "./pages/ContactUsPage";
import AdminPage from "./pages/AdminPage";
import { readActiveTestDraft, clearActiveTestDraft, getActiveTestDraftKey } from "./utils/activeTestDraft";
import { api } from "./api/client";
import { useTestStore } from "./store/testStore";
import { useUiStore } from "./store/uiStore";
import iconDashboard from "./assets/icon-dashboard.png";
import iconGenerate from "./assets/icon-generate.png";
import iconMyTests from "./assets/icon-mytests.png";
import iconCoins from "./assets/icon-coins.png";

function updatePointerSpotlight(event) {
  if (event.pointerType === "touch") return;
  const target = event.target.closest(".card, article, section, button, a, [role='button'], input, select, textarea");
  if (!target || !event.currentTarget.contains(target)) return;
  const rect = target.getBoundingClientRect();
  target.classList.add("spotlight");
  target.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  target.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

function ActiveTestNotice() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [draft, setDraft] = useState(null);
  const storageKey = getActiveTestDraftKey(user);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/take-test/")) {
      setDraft(null);
      return;
    }
    setDraft(readActiveTestDraft(user));
  }, [location.pathname, storageKey]);

  if (!draft?.testId || location.pathname.startsWith("/take-test/")) return null;
  const answeredCount = Object.keys(draft.answers || {}).length;
  const totalQuestions = draft.activeAttempt?.questions?.length || 0;

  const discardTest = () => {
    clearActiveTestDraft(user);
    useTestStore.setState({ activeAttempt: null });
    setDraft(null);
    setConfirmDiscard(false);
  };

  return <div className="px-4 pt-3 lg:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-3 text-sm text-base-content shadow-sm sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={() => setConfirmDiscard(true)} aria-label="Terminate test" title="Terminate test" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rose-400/40 bg-rose-500/10 text-lg font-semibold text-rose-600 transition hover:bg-rose-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-500">&#215;</button>
        <p><b>Test in progress.</b> Your answers are saved on this device ({answeredCount}/{totalQuestions} answered).</p>
      </div>
      <Link to={`/take-test/${draft.testId}`} className="btn btn-sm border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">Resume test &#8594;</Link>
    </div>
    {confirmDiscard && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmDiscard(false); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="discard-test-title" className="generated-test-modal w-full max-w-md rounded-2xl border border-rose-300/25 bg-base-100 p-6 shadow-2xl">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-rose-500/10 text-2xl text-rose-500">!</div>
        <h2 id="discard-test-title" className="font-hero text-xl font-bold">Terminate this test?</h2>
        <p className="mt-2 text-sm leading-relaxed text-base-content/70">Your saved answers and progress will be permanently discarded. Coins already spent to start this test will not be refunded.</p>
        <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmDiscard(false)}>Keep test</button>
          <button type="button" className="btn border-0 bg-rose-600 text-white hover:bg-rose-700" onClick={discardTest}>Terminate test</button>
        </div>
      </section>
    </div>}
  </div>;
}

function MobileBottomBar() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const closeSidebar = useUiStore((state) => state.closeSidebar);
  const items = [
    { to: "/dashboard", label: "Home", icon: iconDashboard, end: true },
    { to: "/generate", label: "Create", icon: iconGenerate },
    { to: "/my-tests", label: "My Tests", icon: iconMyTests },
    { to: "/buy-coins", label: "Buy Coins", icon: iconCoins },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Main navigation">
      {items.map(({ to, label, icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={closeSidebar} className={({ isActive }) => isActive ? "is-active" : ""}>
          <img src={icon} alt="" />
          <span>{label}</span>
        </NavLink>
      ))}
      <button type="button" onClick={toggleSidebar} aria-label="More navigation options">
        <span className="mobile-bottom-more-icon" aria-hidden="true">&#9776;</span>
        <span>More</span>
      </button>
    </nav>
  );
}

function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <ActiveTestNotice />
        <main className="app-main flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <MobileBottomBar />
    </div>
  );
}

function SessionMonitor() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return undefined;
    let current = true;
    api.get("/auth/me").catch((error) => {
      if (current && error?.response?.status === 401) {
        useAuthStore.setState({ user: null, isLoading: false });
      }
    });
    return () => { current = false; };
  }, [location.pathname, user?.id]);

  return null;
}

// function DashboardPage() {
//   const user = useAuthStore((s) => s.user);
//   return (
//     <div className="max-w-xl mx-auto mt-10">
//       <h1 className="text-2xl font-bold">Welcome, {user?.name || user?.email}</h1>
//       <p className="text-sm text-gray-500 mt-1">Email verified: {String(user?.emailVerified)}</p>
//     </div>
//   );
// }

function App() {
  const { user, isLoading, checkSession } = useAuthStore();
  const fetchWallet = useWalletStore((s) => s.fetchWallet);

  useEffect(() => {
    checkSession();
  }, []);

  const applyStoredTheme = useThemeStore((s) => s.applyStoredTheme);

  useEffect(() => {
    applyStoredTheme();
  }, []);

  useEffect(() => {
    if (user) fetchWallet();
  }, [user]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <BrowserRouter>
      <SessionMonitor />
      <div className="app-spotlight-root min-h-screen" onPointerMove={updatePointerSpotlight}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === "ADMIN" ? "/admin" : "/dashboard"} /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={user?.role === "ADMIN" ? <AdminPage /> : user ? <Navigate to="/dashboard" /> : <Navigate to="/login?admin=1" />} />
        <Route
          path="/dashboard"
          element={user?.role === "ADMIN" ? <Navigate to="/admin" /> : user ? <AppShell><DashboardPage /></AppShell> : <Navigate to="/login" />}
        />
        <Route
          path="/generate"
          element={user ? <AppShell><GeneratePage /></AppShell> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route
          path="/my-tests"
          element={user ? <AppShell><MyTestsPage /></AppShell> : <Navigate to="/login" />}
        />
        <Route
          path="/take-test/:id"
          element={user ? <AppShell><TakeTestPage /></AppShell> : <Navigate to="/login" />}
        />
        <Route
          path="/results"
          element={user ? <AppShell><ResultsPage /></AppShell> : <Navigate to="/login" />}
        />
        <Route
          path="/practice"
          element={user ? <AppShell><PublicTestsPage /></AppShell> : <Navigate to="/login" />}
        />
        {/* Referral program disabled for now.
        <Route
          path="/referral"
          element={user ? <AppShell><ReferralPage /></AppShell> : <Navigate to="/login" />}
        />
        */}
        <Route
          path="/skill-radar"
          element={user ? <AppShell><SkillRadarPage /></AppShell> : <Navigate to="/login" />}
        />

        <Route
          path="/buy-coins"
          element={user ? <AppShell><BuyCoinsPage /></AppShell> : <Navigate to="/login" />}
        />

        <Route
          path="/contests"
          element={user ? <AppShell><ContestsPage /></AppShell> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />

        <Route path="/change-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route
          path="/contact-us"
          element={user ? <AppShell><ContactUsPage /></AppShell> : <Navigate to="/login" />}
        />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
