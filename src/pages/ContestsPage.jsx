import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContestStore } from "../store/contestStore";
import { useThemeStore } from "../store/themeStore";

const rewards = [
  { place: "1st place", coins: 50, icon: "♛", tone: "from-amber-300 to-orange-500", glow: "shadow-amber-500/20" },
  { place: "2nd place", coins: 30, icon: "♜", tone: "from-slate-200 to-slate-400", glow: "shadow-slate-400/10" },
  { place: "3rd place", coins: 20, icon: "♟", tone: "from-orange-300 to-amber-700", glow: "shadow-orange-500/10" },
];

function moveSpotlight(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
}

function ContestCard({ contest, entered, onEnter, onStart }) {
  return <article onPointerMove={moveSpotlight} className="spotlight contest-featured group relative overflow-hidden rounded-3xl border border-indigo-400/30 bg-[#111a31] p-5 shadow-2xl shadow-indigo-950/30 transition duration-300 hover:-translate-y-1 hover:border-violet-400/60 hover:shadow-violet-950/40 sm:p-7">
    <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl transition group-hover:bg-violet-500/25" />
    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-64 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-200"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" /></span>Live now</span>
        <span className="contest-entry rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Entry <b className="text-amber-300">{contest.entryFeeCoins} coins</b></span>
      </div>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_240px] lg:items-center">
        <div><p className="contest-eyebrow mb-2 text-xs font-semibold uppercase tracking-[.22em] text-violet-300">AptiGen weekly challenge</p><h2 className="contest-title font-hero text-3xl font-extrabold leading-tight text-white sm:text-4xl">{contest.title || contest.name || "This Week’s Contest"}</h2><p className="contest-copy mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">Put your knowledge to the test. Compete for the top spot and earn bonus AG coins every Sunday.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300"><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">⚡ Timed challenge</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">🏅 Top 3 win rewards</span><span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">🪙 Bonus coins</span></div>
          <button onClick={() => entered ? onStart(contest) : onEnter(contest)} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:scale-[1.01] hover:brightness-110 sm:w-auto sm:min-w-60">{entered ? <>Start contest <span aria-hidden="true">→</span></> : <>Enter the contest <span aria-hidden="true">↗</span></>}</button>
          {entered && <p className="mt-2 text-xs text-emerald-300">You’re in! Your challenge is ready.</p>}
        </div>
        <div className="relative mx-auto grid h-48 w-48 place-items-center sm:h-56 sm:w-56">
          <div className="absolute inset-0 rounded-full border border-violet-300/15" /><div className="absolute inset-4 rounded-full border border-dashed border-blue-300/25" /><div className="absolute inset-8 rounded-full bg-gradient-to-br from-violet-500/25 to-cyan-500/10 blur-md" />
          <div className="relative grid h-28 w-28 rotate-3 place-items-center rounded-[2rem] border border-white/15 bg-gradient-to-br from-indigo-500/80 to-violet-700/80 text-6xl shadow-2xl shadow-violet-950/70 transition duration-500 group-hover:rotate-0 group-hover:scale-110">🏆</div>
          <span className="absolute right-3 top-5 animate-bounce text-2xl [animation-duration:2.6s]">✦</span><span className="absolute bottom-5 left-1 text-xl text-cyan-300">✧</span><span className="absolute left-4 top-8 text-sm text-amber-300">✦</span>
        </div>
      </div>
    </div>
  </article>;
}

export default function ContestsPage() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme !== "dark";
  const { liveContests, fetchLive, enterContest, startContestAttempt } = useContestStore();
  const [entering, setEntering] = useState(null);
  const [entered, setEntered] = useState({});
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchLive(); }, []);

  const handleEnter = async (contest) => {
    setError("");
    setJoining(true);
    try {
      await enterContest(contest.id);
      setEntered((prev) => ({ ...prev, [contest.id]: true }));
      setEntering(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not enter contest. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async (contest) => {
    setError("");
    try {
      await startContestAttempt(contest.id, contest.testId);
      navigate(`/take-test/${contest.testId}?contest=${contest.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the contest. Please try again.");
    }
  };

  return <main className={`contest-page mx-auto max-w-6xl space-y-7 pb-8 ${isLight ? "contest-page-light" : ""}`}>
    <header onPointerMove={moveSpotlight} className="spotlight contest-hero relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#111a31] via-[#17153a] to-[#21144a] px-6 py-7 shadow-xl shadow-indigo-950/20 sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" /><div className="pointer-events-none absolute bottom-0 right-1/3 h-36 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><span className="contest-kicker inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">🎮 Play • Compete • Earn</span><h1 className="contest-heading mt-4 font-hero text-3xl font-extrabold text-white sm:text-4xl">The contest is on<span className="text-cyan-300">.</span></h1><p className="contest-copy mt-2 max-w-xl text-sm text-slate-300 sm:text-base">Show what you know, climb the ranks, and take home bonus coins.</p></div><div className="contest-day flex items-center gap-3 rounded-2xl border border-white/10 bg-black/15 p-3 pr-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-400/15 text-2xl">🗓️</span><div><p className="text-xs text-slate-400">Contest day</p><p className="contest-day-label font-semibold text-white">Every Sunday</p></div></div></div>
    </header>

    {error && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button onClick={() => setError("")} className="rounded-lg px-2 py-1 hover:bg-rose-500/20" aria-label="Dismiss error">✕</button></div>}

    <section><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-400">Jump in</p><h2 className="mt-1 font-hero text-xl font-bold text-base-content sm:text-2xl">Live contest</h2></div><span className="text-sm text-base-content/50">{liveContests.length} available</span></div>
      {liveContests.length ? <div className="space-y-4">{liveContests.map((contest) => <ContestCard key={contest.id} contest={contest} entered={entered[contest.id]} onEnter={setEntering} onStart={handleStart} />)}</div> : <div onPointerMove={moveSpotlight} className="spotlight contest-empty relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-[#121b32] to-[#171536] p-8 text-center sm:p-12"><div className="pointer-events-none absolute left-1/2 top-0 h-48 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl"/><div className="relative"><div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/10 text-4xl">🌙</div><h3 className="font-hero text-xl font-bold text-white">The next challenge is getting ready</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-300">No contest is live right now. Check back Sunday and be ready to claim your spot on the leaderboard.</p><div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300"><span className="h-2 w-2 rounded-full bg-amber-400"/>Weekly contests • Every Sunday</div></div></div>}
    </section>

    <section><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-500">The rewards</p><h2 className="mt-1 font-hero text-xl font-bold text-base-content sm:text-2xl">A podium worth chasing</h2></div><div className="grid gap-3 sm:grid-cols-3">{rewards.map((reward) => <article onPointerMove={moveSpotlight} key={reward.place} className={`spotlight group rounded-2xl border border-base-300 bg-base-100 p-4 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${reward.glow}`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-base-content/60">{reward.place}</span><span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${reward.tone} text-xl text-slate-900 shadow-md transition group-hover:rotate-6`}>{reward.icon}</span></div><p className="mt-3 font-hero text-2xl font-extrabold text-base-content">{reward.coins} <span className="text-sm font-semibold text-amber-500">AG coins</span></p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-base-200"><div className={`h-full rounded-full bg-gradient-to-r ${reward.tone} transition-all duration-700 group-hover:w-full`} style={{ width: `${(reward.coins / 50) * 100}%` }}/></div></article>)}</div></section>

    <section className="grid gap-3 sm:grid-cols-3">{[{ icon: "01", title: "Join the contest", copy: "Use your coins to claim an entry." }, { icon: "02", title: "Take the challenge", copy: "Complete the contest test while it’s live." }, { icon: "03", title: "Earn your place", copy: "Top scorers win bonus AG coins." }].map((step) => <div onPointerMove={moveSpotlight} key={step.icon} className="spotlight flex items-start gap-3 rounded-2xl border border-base-300/80 bg-base-100/70 p-4"><span className="font-hero text-sm font-bold text-violet-500">{step.icon}</span><div><h3 className="text-sm font-semibold text-base-content">{step.title}</h3><p className="mt-1 text-xs leading-relaxed text-base-content/55">{step.copy}</p></div></div>)}</section>

    {entering && <div className="modal modal-open" onClick={(e) => e.target === e.currentTarget && !joining && setEntering(null)}><div className="modal-box relative overflow-hidden rounded-3xl border border-violet-400/20 bg-[#121a30] text-center text-white shadow-2xl shadow-indigo-950/60"><div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"/><div className="relative"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-400/15 text-3xl">🏆</div><h3 className="font-hero text-xl font-bold">Ready to take the challenge?</h3><p className="py-3 text-sm leading-relaxed text-slate-300">Entry costs <b className="text-amber-300">{entering.entryFeeCoins} AG coins</b>. Top three scorers win bonus coins: <span className="whitespace-nowrap">🥇 50 · 🥈 30 · 🥉 20</span>.</p><p className="text-xs text-slate-400">Entry fees are non-refundable once you join.</p><div className="modal-action justify-center"><button className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50" disabled={joining} onClick={() => setEntering(null)}>Maybe later</button><button className="rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:opacity-60" disabled={joining} onClick={() => handleEnter(entering)}>{joining ? "Joining…" : "Confirm & join"}</button></div></div></div></div>}
  </main>;
}
