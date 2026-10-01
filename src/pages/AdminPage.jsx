import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuthStore } from "../store/authStore";
import { compressImageIfNeeded } from "../utils/compressImage";
import { useNavigate } from "react-router-dom";

const card = "admin-panel rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_18px_50px_rgba(91,33,182,.16)]";
const input = "w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-400";
const dateOnly = (date) => date.toISOString().slice(0, 10);
const formatDate = (value) => value ? new Date(value).toLocaleString() : "â€”";

function StatCard({ label, value, detail }) {
  return <div className={card}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value ?? "â€”"}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div>;
}

function ActivityList({ title, rows, render }) {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const records = rows || [];
  const pageCount = Math.ceil(records.length / pageSize);
  const visibleRows = records.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => { setPage((current) => Math.min(current, Math.max(0, pageCount - 1))); }, [pageCount]);

  return <section><h3 className="mb-2 font-semibold text-white">{title}</h3>{records.length ? <><ul className="space-y-2">{visibleRows.map((row, index) => <li key={row.id ?? page * pageSize + index} className="rounded-xl bg-slate-950/60 px-3 py-2 text-sm">{render(row)}</li>)}</ul>{pageCount > 1 && <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400"><span>Showing {page * pageSize + 1}â€“{Math.min((page + 1) * pageSize, records.length)} of {records.length}</span><div className="flex gap-2"><button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} className="rounded-lg border border-slate-700 px-2.5 py-1.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="self-center">{page + 1} / {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} disabled={page >= pageCount - 1} className="rounded-lg border border-slate-700 px-2.5 py-1.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>}</> : <p className="text-sm text-slate-500">No records yet.</p>}</section>;
}

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [period, setPeriod] = useState("7days");
  const [from, setFrom] = useState(dateOnly(new Date(Date.now() - 6 * 86400000)));
  const [to, setTo] = useState(dateOnly(new Date()));
  const [overview, setOverview] = useState(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [blockMessage, setBlockMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [contestTitle, setContestTitle] = useState("");
  const [contestImages, setContestImages] = useState([]);
  const [contestFee, setContestFee] = useState(5);
  const [contestBusy, setContestBusy] = useState(false);
  const [contestNotice, setContestNotice] = useState("");
  const [adminContests, setAdminContests] = useState([]);
  const [adminTests, setAdminTests] = useState([]);
  const [contestTestId, setContestTestId] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const loadOverview = useCallback(async () => {
    const params = { period };
    if (period === "custom") { params.from = from; params.to = to; }
    const { data } = await api.get("/admin/overview", { params });
    setOverview(data);
  }, [period, from, to]);
  const loadChats = useCallback(async () => {
    const { data } = await api.get("/admin/chats"); setChats(Array.isArray(data) ? data : []);
  }, []);
  const loadContests = useCallback(async () => {
    const { data } = await api.get("/contests/admin"); setAdminContests(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { loadOverview().catch((e) => setError(e?.response?.data?.message || "Could not load admin metrics.")); }, [loadOverview]);
  useEffect(() => { loadChats().catch(() => {}); }, [loadChats]);
  useEffect(() => { loadContests().catch(() => {}); }, [loadContests]);
  useEffect(() => { api.get("/tests/mine").then(({ data }) => setAdminTests(Array.isArray(data) ? data : [])).catch(() => {}); }, []);
  useEffect(() => { const timer = window.setInterval(() => loadChats().catch(() => {}), 5000); return () => window.clearInterval(timer); }, [loadChats]);
  useEffect(() => {
    if (!activeChat) return undefined;
    const refresh = async () => { try { const { data } = await api.get(`/admin/chats/${activeChat.id}/messages`); setMessages(Array.isArray(data) ? data : []); } catch { /* keep existing messages visible */ } };
    refresh(); const timer = window.setInterval(refresh, 4000); return () => window.clearInterval(timer);
  }, [activeChat]);

  useEffect(() => {
    const userId = selected?.id;
    if (!userId) return undefined;
    let current = true;
    const refreshActivity = async () => {
      try {
        const { data } = await api.get(`/admin/users/${userId}`);
        if (current) setSelected((existing) => existing?.id === userId ? { ...existing, ...data } : existing);
      } catch { /* keep the last loaded activity visible during temporary errors */ }
    };
    const timer = window.setInterval(refreshActivity, 5000);
    return () => { current = false; window.clearInterval(timer); };
  }, [selected?.id]);

  const searchUsers = async (event) => {
    event?.preventDefault(); setError("");
    try { const { data } = await api.get("/admin/users", { params: { query } }); setUsers(Array.isArray(data) ? data : []); }
    catch (e) { setError(e?.response?.data?.message || "User search failed."); }
  };
  const selectUser = async (person) => {
    setSelected(person); setError("");
    try { const { data } = await api.get(`/admin/users/${person.id}`); setSelected(data); setBlockMessage(data.blockMessage || ""); }
    catch (e) { setError(e?.response?.data?.message || "Could not load user activity."); }
  };
  const toggleBlock = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try {
      const { data } = await api.patch(`/admin/users/${selected.id}/block`, { blocked: !selected.blocked, message: blockMessage });
      setSelected((current) => ({ ...current, ...data }));
      setUsers((current) => current.map((item) => item.id === selected.id ? { ...item, ...data } : item));
    } catch (e) { setError(e?.response?.data?.message || "Could not update the block status."); }
    finally { setBusy(false); }
  };
  const sendReply = async (event) => {
    event.preventDefault(); if (!activeChat || !reply.trim()) return;
    try { await api.post(`/admin/chats/${activeChat.id}/messages`, { message: reply.trim() }); setReply(""); const { data } = await api.get(`/admin/chats/${activeChat.id}/messages`); setMessages(Array.isArray(data) ? data : []); await loadChats(); }
    catch (e) { setError(e?.response?.data?.message || "Could not send the reply."); }
  };

  const createContest = async (event) => {
    event.preventDefault();
    if (!contestTestId && (!contestTitle.trim() || !contestImages.length)) { setError("Choose an existing test or add a contest title and image."); return; }
    setContestBusy(true); setError(""); setContestNotice("");
    try {
      let test;
      if (contestTestId) {
        test = adminTests.find((item) => String(item.id) === String(contestTestId));
      } else {
        const form = new FormData();
        const uploadImages = await Promise.all(contestImages.map(compressImageIfNeeded));
        uploadImages.forEach((file) => form.append("images", file));
        form.append("title", contestTitle.trim()); form.append("timerMode", "STANDARD"); form.append("secondsPerQuestion", "60"); form.append("mode", "AUTO"); form.append("questionCount", "10");
        const response = await api.post("/generate", form, { headers: { "Content-Type": "multipart/form-data" } });
        test = response.data;
      }
      const { data: contest } = await api.post("/contests/admin", { testId: test.id, entryFeeCoins: Number(contestFee) });
      setContestNotice(`Contest scheduled for Sunday ${contest.scheduledDate}; results publish Monday at 7:00 PM.`);
      setContestTitle(""); setContestImages([]); setContestTestId("");
      await loadContests();
    } catch (e) { setError(e?.response?.data?.message || "Could not create the weekly contest."); }
    finally { setContestBusy(false); }
  };
  const removeContest = async (contest) => {
    if (!window.confirm("Remove this contest? Entry fees will be refunded to participants.")) return;
    setContestBusy(true); setError("");
    try { await api.delete(`/contests/admin/${contest.id}`); setAdminContests((current) => current.filter((item) => item.id !== contest.id)); }
    catch (e) { setError(e?.response?.data?.message || "Could not remove the contest."); }
    finally { setContestBusy(false); }
  };

  const bars = Array.isArray(overview?.daily) ? overview.daily : [];
  const maxBar = useMemo(() => Math.max(1, ...bars.map((d) => Number(d.newUsers || 0))), [bars]);
  if (user?.role !== "ADMIN") return <div className="mx-auto max-w-xl rounded-2xl border border-rose-400/30 bg-rose-950/40 p-8 text-center text-white"><h1 className="text-2xl font-bold">Administrator access required</h1><p className="mt-2 text-slate-300">This account is not enabled for the admin panel.</p><button onClick={logout} className="mt-5 rounded-lg bg-violet-600 px-4 py-2">Sign out</button></div>;

  return <div className="admin-shell relative isolate min-h-screen -m-4 overflow-hidden bg-[#080d19] p-4 pl-72 text-slate-100 lg:-m-6 lg:p-7 lg:pl-64">
    <style>{`
      @keyframes admin-enter { from { opacity:0; transform:translateY(14px) scale(.99); } to { opacity:1; transform:translateY(0) scale(1); } }
      @keyframes admin-drift { 0%,100% { transform:translate3d(0,0,0) scale(1); } 50% { transform:translate3d(18px,-16px,0) scale(1.08); } }
      @keyframes admin-bar-rise { from { transform:scaleY(.03); opacity:.3; } to { transform:scaleY(1); opacity:1; } }
      @keyframes admin-pulse { 0%,100% { opacity:.35; } 50% { opacity:.8; } }
      .admin-shell { background-image:radial-gradient(ellipse at 12% 5%,rgba(67,56,202,.16),transparent 36%),radial-gradient(ellipse at 90% 42%,rgba(8,145,178,.09),transparent 32%); }
      .admin-sidebar { background:linear-gradient(180deg,rgba(16,22,55,.98),rgba(7,13,32,.98)); }
      .admin-sidebar { display:none!important; }
      .admin-section-nav { background:linear-gradient(180deg,rgba(16,22,55,.98),rgba(7,13,32,.98)); }
      .admin-section-nav { display:none!important; }
      .admin-workflow-sidebar { background:linear-gradient(180deg,rgba(16,22,55,.98),rgba(7,13,32,.98)); }
      .admin-main[data-section="users"] > section:nth-of-type(1), .admin-main[data-section="users"] > section:nth-of-type(3), .admin-main[data-section="users"] > section:nth-of-type(4) { display:none; }
      .admin-main[data-section="overview"] > section:nth-of-type(2), .admin-main[data-section="overview"] > section:nth-of-type(3), .admin-main[data-section="overview"] > section:nth-of-type(4) { display:none; }
      .admin-main[data-section="analytics"] > section:nth-of-type(2), .admin-main[data-section="analytics"] > section:nth-of-type(3), .admin-main[data-section="analytics"] > section:nth-of-type(4) { display:none; }
      .admin-main[data-section="contests"] > section:nth-of-type(1), .admin-main[data-section="contests"] > section:nth-of-type(2), .admin-main[data-section="contests"] > section:nth-of-type(4) { display:none; }
      .admin-main[data-section="support"] > section:nth-of-type(1), .admin-main[data-section="support"] > section:nth-of-type(2), .admin-main[data-section="support"] > section:nth-of-type(3) { display:none; }
      .admin-main[data-section="settings"] > section { display:none; }
      .admin-main[data-section="settings"] > section:last-of-type { display:block; }
      .admin-shell::before,.admin-shell::after { content:"";position:absolute;z-index:-1;width:22rem;height:22rem;border-radius:9999px;filter:blur(75px);opacity:.14;pointer-events:none;animation:admin-drift 14s ease-in-out infinite; }
      .admin-shell::before { top:3rem;right:-8rem;background:#7c3aed; }
      .admin-shell::after { top:44rem;left:-12rem;width:18rem;height:18rem;background:#0891b2;animation-delay:-6s; }
      .admin-shell header { animation:admin-enter .55s cubic-bezier(.2,.75,.25,1) both; }
      .admin-shell main>section { animation:admin-enter .5s cubic-bezier(.2,.75,.25,1) both;transition:transform .25s,border-color .25s,box-shadow .25s; }
      .admin-shell main>section:nth-child(2) { animation-delay:80ms; }
      .admin-shell main>section:nth-child(3) { animation-delay:150ms; }
      .admin-shell main>section:hover { transform:translateY(-2px);border-color:rgba(167,139,250,.28);box-shadow:0 18px 50px rgba(91,33,182,.12); }
      .admin-shell main>section:first-child>div:nth-child(2)>div { animation:admin-enter .55s cubic-bezier(.2,.75,.25,1) both;transition:transform .22s,border-color .22s,box-shadow .22s; }
      .admin-shell main>section:first-child>div:nth-child(2)>div:hover { transform:translateY(-4px);border-color:rgba(167,139,250,.4);box-shadow:0 14px 34px rgba(91,33,182,.2); }
      .admin-shell main>section:first-child>div:nth-child(2)>div p:nth-child(2) { transition:color .2s,transform .2s; }
      .admin-shell main>section:first-child>div:nth-child(2)>div:hover p:nth-child(2) { color:#c4b5fd;transform:translateX(2px); }
      .admin-shell main>section:first-child>div:nth-child(3)>div>div>div { transform-origin:bottom;animation:admin-bar-rise .8s cubic-bezier(.16,1,.3,1) both;transition:filter .2s; }
      .admin-shell main>section:first-child>div:nth-child(3)>div>div>div:hover { filter:brightness(1.4) drop-shadow(0 0 7px currentColor); }
      .admin-shell li { transition:transform .18s,background-color .18s;animation:admin-enter .25s ease-out both; }
      .admin-shell li:hover { transform:translateX(3px);background-color:rgba(51,65,85,.7); }
      .admin-shell button { transition:transform .18s,filter .18s,background-color .18s; }
      .admin-shell button:not(:disabled):hover { transform:translateY(-1px);filter:brightness(1.1); }
      .admin-shell header { background:linear-gradient(115deg,rgba(30,27,75,.72),rgba(15,23,42,.8) 58%,rgba(8,47,73,.38)); }
      .admin-shell header p:first-child { animation:admin-pulse 3s ease-in-out infinite; }
      @media (prefers-reduced-motion:reduce) { .admin-shell *, .admin-shell *::before, .admin-shell *::after { animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important; } }
    `}</style>
    <aside className="admin-workflow-sidebar fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-white/10 p-4 text-slate-100 shadow-2xl lg:w-60">
      <div className="mb-8 border-b border-white/10 px-2 pb-6"><p className="text-2xl font-black">Apti<span className="text-violet-400">Gen</span></p><p className="mt-1 text-[9px] uppercase tracking-[.3em] text-slate-500">Control room</p></div>
      <nav className="space-y-1.5">
        {[['⌂', 'Overview', 'overview'], ['♙', 'Users', 'users'], ['▥', 'Analytics', 'analytics'], ['♕', 'Contests', 'contests'], ['◌', 'Support', 'support'], ['⚙', 'Settings', 'settings']].map(([icon, label, section]) => <button type="button" key={label} onClick={() => setActiveSection(section)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${activeSection === section ? 'bg-violet-600/40 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><span className="w-5 text-center text-lg">{icon}</span>{label}</button>)}
      </nav>
      <div className="my-5 border-t border-white/10" />
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-slate-500">Test workflow</p>
      <nav className="space-y-1.5">
        <button type="button" onClick={() => navigate('/admin/generate')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-violet-500/15 hover:text-white"><span className="w-5 text-center text-lg">✦</span>Generate Test</button>
        <button type="button" onClick={() => navigate('/admin/tests')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-violet-500/15 hover:text-white"><span className="w-5 text-center text-lg">▤</span>My Tests</button>
        <button type="button" onClick={() => navigate('/admin/contests')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-violet-500/15 hover:text-white"><span className="w-5 text-center text-lg">♕</span>Add Contest</button>
        <button type="button" onClick={() => navigate('/admin/mock-tests')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-300 hover:bg-violet-500/15 hover:text-white"><span className="w-5 text-center text-lg">✚</span>Add Mock Test</button>
      </nav>
    </aside>
    <div className="mx-auto flex max-w-[1800px] gap-5"><aside className="admin-section-nav w-56 shrink-0 rounded-2xl border border-white/10 p-4"><div className="mb-8 px-2"><p className="text-2xl font-black">Apti<span className="text-violet-400">Gen</span></p><p className="text-[9px] uppercase tracking-[.3em] text-slate-500">Control room</p></div><nav className="space-y-2">{[["⌂", "Overview", "overview"], ["♙", "Users", "users"], ["▥", "Analytics", "analytics"], ["♕", "Contests", "contests"], ["◌", "Support", "support"], ["⚙", "Settings", "settings"]].map(([icon, label, section]) => <button type="button" key={label} onClick={() => setActiveSection(section)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${activeSection === section ? "bg-violet-600/30 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span className="text-lg">{icon}</span>{label}</button>)}</nav></aside>
      <aside className="admin-sidebar hidden w-56 shrink-0 rounded-2xl border border-white/10 p-4 lg:block"><div className="mb-8 px-2"><p className="text-2xl font-black">Apti<span className="text-violet-400">Gen</span></p><p className="text-[9px] uppercase tracking-[.3em] text-slate-500">Control room</p></div><nav className="space-y-2">{[["⌂", "Overview"], ["♙", "Users"], ["▥", "Analytics"], ["♕", "Contests"], ["◌", "Support"], ["⚙", "Settings"]].map(([icon, label], index) => <a key={label} href={index === 0 ? "#top" : `#${label.toLowerCase()}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${index === 0 ? "bg-violet-600/30 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><span className="text-lg">{icon}</span>{label}</a>)}</nav></aside>
      <div className="min-w-0 flex-1"><header id="top" className="mx-auto mb-7 flex max-w-[1600px] flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-violet-300">AptiGen control room</p><h1 className="mt-1 text-3xl font-extrabold">Admin dashboard</h1><p className="mt-1 text-sm text-slate-400">Signed in as {user?.email}</p></div><div className="flex items-center gap-3"><span className="hidden rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 sm:block">⌁ Past 7 days</span><button onClick={logout} className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">Sign out</button></div></header>
    <main className="admin-main mx-auto max-w-[1600px] space-y-6" data-section={activeSection}>
      {error && <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">{error}</div>}
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold">Platform overview</h2><p className="text-sm text-slate-400">New registrations, tests generated, and coins spent by day.</p></div><div className="flex flex-wrap items-end gap-2"><label className="text-xs text-slate-400">Range<select className={`${input} mt-1`} value={period} onChange={(e) => setPeriod(e.target.value)}><option value="7days">Past 7 days</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="custom">Custom dates</option></select></label>{period === "custom" && <><label className="text-xs text-slate-400">From<input type="date" className={`${input} mt-1`} value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="text-xs text-slate-400">To<input type="date" className={`${input} mt-1`} value={to} onChange={(e) => setTo(e.target.value)} /></label></>}</div></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Total users" value={overview?.totalUsers} /><StatCard label="Active users" value={overview?.activeUsers} detail="Logged in within the last 15 minutes" /><StatCard label="New users" value={overview?.newUsers} /><StatCard label="Tests generated" value={overview?.testsGenerated} /><StatCard label="Coins spent" value={overview?.coinsSpent} /></div>
        <div className="mt-6 grid h-56 grid-cols-7 items-end gap-3 rounded-xl bg-slate-950/50 p-4">{bars.map((day) => <div key={day.date} className="flex h-full flex-col items-center justify-end gap-2" title={`${day.date}: ${day.newUsers} new users, ${day.testsGenerated} tests, ${day.coinsSpent} coins`}><div className="relative flex h-[78%] w-full items-end justify-center gap-1"><div className="w-1/4 rounded-t bg-cyan-400" style={{ height: `${Math.max(4, (day.newUsers || 0) / maxBar * 100)}%` }} /><div className="w-1/4 rounded-t bg-violet-500" style={{ height: `${Math.max(4, (day.testsGenerated || 0) / Math.max(1, ...bars.map((x) => x.testsGenerated || 0)) * 100)}%` }} /><div className="w-1/4 rounded-t bg-amber-400" style={{ height: `${Math.max(4, (day.coinsSpent || 0) / Math.max(1, ...bars.map((x) => x.coinsSpent || 0)) * 100)}%` }} /></div><span className="text-[10px] text-slate-500">{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span></div>)}</div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400"><span className="text-cyan-300">â–  New users</span><span className="text-violet-300">â–  Tests generated</span><span className="text-amber-300">â–  Coins spent</span></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]"><div className={card}><h2 className="text-xl font-bold">Find a user</h2><form onSubmit={searchUsers} className="mt-4 flex gap-2"><input className={input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" /><button className="shrink-0 rounded-xl bg-violet-600 px-4 font-semibold hover:bg-violet-500">Search</button></form><div className="mt-4 max-h-[480px] space-y-2 overflow-auto">{users.map((person) => <button key={person.id} onClick={() => selectUser(person)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === person.id ? "border-violet-400 bg-violet-500/10" : "border-slate-800 bg-slate-950/40 hover:border-slate-600"}`}><span className="flex items-center justify-between gap-2"><span className="truncate font-medium">{person.name}</span><span className={`rounded-full px-2 py-1 text-[10px] ${person.blocked ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"}`}>{person.blocked ? "Blocked" : "Active"}</span></span><span className="block truncate text-xs text-slate-400">{person.email}</span></button>)}</div></div>
      <div className={card}>{selected ? <><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{selected.name}</h2><p className="text-sm text-slate-400">{selected.email} Â· Joined {formatDate(selected.createdAt)}</p></div><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">{selected.blocked ? "Blocked account" : "Account enabled"}</span></div>
        <div className="grid gap-5 lg:grid-cols-2"><ActivityList key={`${selected.id}-logins`} title="Login & logout history" rows={selected.loginHistory} render={(x) => <><span className="font-medium">{x.eventType || x.type}</span><span className="ml-2 text-slate-400">{formatDate(x.occurredAt || x.createdAt)}</span></>} /><ActivityList key={`${selected.id}-tests`} title="Tests attempted" rows={selected.testAttempts} render={(x) => <><span className="font-medium">{x.testTitle || `Test #${x.testId}`}</span><span className="block text-xs text-slate-400">Started {formatDate(x.startedAt)} Â· {x.submittedAt ? `Score ${x.score ?? "â€”"}/${x.totalQuestions}` : "In progress"}</span></>} /><ActivityList key={`${selected.id}-coins`} title="Coin activity" rows={selected.coinTransactions} render={(x) => <><span className={x.amount < 0 ? "text-rose-300" : "text-emerald-300"}>{x.amount > 0 ? "+" : ""}{x.amount} coins</span><span className="ml-2 text-slate-400">{x.type} Â· {formatDate(x.createdAt)}</span></>} />{/* Referral activity disabled for now. <ActivityList key={`${selected.id}-referrals`} title="Referrals & rewards" rows={selected.referrals} render={(x) => <><span>{x.refereeName || x.refereeEmail || `User #${x.refereeUserId}`}</span><span className="ml-2 text-slate-400">{x.relation} Â· {x.rewarded ? `${x.rewardCoins} coins rewarded` : "Reward pending"} Â· {formatDate(x.createdAt)}</span></>} /> */}</div>
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-4"><h3 className="font-semibold">Account access</h3><p className="mt-1 text-xs text-slate-400">Blocked users see this message and a link to contact support when they try to sign in.</p><textarea className={`${input} mt-3 min-h-20 resize-y`} maxLength={500} value={blockMessage} onChange={(e) => setBlockMessage(e.target.value)} placeholder="Reason shown to the user when blocked" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-slate-500">Support link: support@aptigen.com</span><button disabled={busy || (!selected.blocked && !blockMessage.trim())} onClick={toggleBlock} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 ${selected.blocked ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"}`}>{busy ? "Savingâ€¦" : selected.blocked ? "Unblock user" : "Block user"}</button></div></div>
        <button onClick={async () => { try { await api.post("/admin/chats", { userId: selected.id }); await loadChats(); const { data } = await api.get("/admin/chats"); const chat = data.find((item) => item.userId === selected.id); if (chat) setActiveChat(chat); } catch (e) { setError(e?.response?.data?.message || "Could not open a support conversation."); } }} className="mt-4 rounded-xl border border-violet-400/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-500/10">Start a support chat</button>
      </> : <div className="grid min-h-64 place-items-center text-center"><div><div className="text-4xl">âŒ•</div><p className="mt-2 font-semibold">Select a user to inspect their activity</p><p className="mt-1 text-sm text-slate-500">Search supports either name or email.</p></div></div>}</div></section>

      <section id="contests" className={card}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold">Contest management</h2><p className="mt-1 text-sm text-slate-400">Create the next weekly contest or remove the current scheduled/live contest.</p></div><span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Results publish Monday at 7:00 PM IST</span></div>{adminContests.length > 0 && <div className="mt-4 space-y-2">{adminContests.map((contest) => <div key={contest.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"><div><p className="font-semibold">Weekly contest #{contest.id}</p><p className="text-xs text-slate-400">Sunday {contest.scheduledDate} · {contest.status} · Entry {contest.entryFeeCoins} coins</p></div><button disabled={contestBusy} onClick={() => removeContest(contest)} className="rounded-lg border border-rose-400/40 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/10 disabled:opacity-50">Remove contest</button></div>)}</div>}{contestNotice && <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{contestNotice}</p>}<form onSubmit={createContest} className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-sm text-slate-300">Contest/test title<input className={`${input} mt-1`} value={contestTitle} onChange={(e) => setContestTitle(e.target.value)} /></label><label className="text-sm text-slate-300">Entry fee<input type="number" min="0" className={`${input} mt-1`} value={contestFee} onChange={(e) => setContestFee(e.target.value)} /></label><label className="text-sm text-slate-300 md:col-span-2">Images<input type="file" accept="image/*" multiple className={`${input} mt-1`} onChange={(e) => setContestImages(Array.from(e.target.files || []))} /></label><button disabled={contestBusy} className="rounded-xl bg-violet-600 px-4 py-2.5 font-semibold disabled:opacity-50 md:col-span-2">{contestBusy ? "Generating…" : "Generate test & add contest"}</button></form></section>
      <section className={card}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Support conversations</h2><p className="text-sm text-slate-400">Review requests and reply to users.</p></div><button onClick={() => loadChats().catch(() => {})} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Refresh</button></div><div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><div className="max-h-[420px] space-y-2 overflow-auto">{chats.map((chat) => <button key={chat.id} onClick={() => setActiveChat(chat)} className={`w-full rounded-xl border p-3 text-left ${activeChat?.id === chat.id ? "border-violet-400 bg-violet-500/10" : "border-slate-800 bg-slate-950/40"}`}><span className="block font-medium">{chat.subject || `Conversation #${chat.id}`}</span><span className="block text-xs text-slate-400">{chat.userName || chat.userEmail} Â· {chat.status}</span></button>)}{!chats.length && <p className="rounded-xl bg-slate-950/50 p-4 text-sm text-slate-500">No support conversations yet.</p>}</div><div className="flex min-h-72 flex-col rounded-xl border border-slate-800 bg-slate-950/40 p-3">{activeChat ? <><div className="mb-3 border-b border-slate-800 pb-3"><p className="font-semibold">{activeChat.subject || `Conversation #${activeChat.id}`}</p><p className="text-xs text-slate-400">{activeChat.userName || activeChat.userEmail}</p></div><div className="flex-1 space-y-2 overflow-auto">{messages.map((message) => { const src = message.attachmentUrl?.startsWith("http") ? message.attachmentUrl : `${(api.defaults.baseURL || "").replace(/\/api\/?$/, "")}${message.attachmentUrl || ""}`; return <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.senderType === "ADMIN" ? "ml-auto bg-violet-600 text-white" : "bg-slate-800 text-slate-100"}`}><p className="whitespace-pre-wrap">{message.message}</p>{message.attachmentUrl && (message.attachmentType === "image" ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt="User attachment" className="mt-2 max-h-64 max-w-full rounded-lg object-contain" /></a> : <a href={src} target="_blank" rel="noreferrer" className="mt-2 block underline">Download {message.attachmentName || "attachment"}</a>)}<time className="mt-1 block text-[10px] opacity-60">{formatDate(message.createdAt)}</time></div>; })}</div><form onSubmit={sendReply} className="mt-3 flex gap-2"><input className={input} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a replyâ€¦" /><button className="rounded-xl bg-violet-600 px-4 font-semibold">Send</button></form></> : <div className="grid flex-1 place-items-center text-sm text-slate-500">Choose a conversation to view it and reply.</div>}</div></div></section>
      {activeSection === "settings" && <section className={`${card} min-h-96`}><div className="mx-auto max-w-2xl py-10 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/15 text-3xl">⚙</div><h2 className="mt-5 text-2xl font-bold">Upcoming features</h2><p className="mt-2 text-slate-400">Admin settings are being prepared for the next release.</p><div className="mt-7 grid gap-3 text-left sm:grid-cols-2"><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="font-semibold text-white">Notification controls</p><p className="mt-1 text-xs text-slate-500">Manage platform announcements and email alerts.</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="font-semibold text-white">Roles & permissions</p><p className="mt-1 text-xs text-slate-500">Create scoped administrator access.</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="font-semibold text-white">Platform preferences</p><p className="mt-1 text-xs text-slate-500">Configure contest defaults and dashboard options.</p></div><div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"><p className="font-semibold text-white">Audit logs</p><p className="mt-1 text-xs text-slate-500">Review administrative actions and changes.</p></div></div></div></section>}
    </main></div>
    </div>;
  </div>;
}
