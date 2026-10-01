   import { useEffect, useState } from "react";
   import { useNavigate } from "react-router-dom";
   import { useTestStore } from "../store/testStore";
   import { useDashboardStore } from "../store/dashboardStore";
   import docIllustration from "../assets/icon-doc-ilus.png";
   import { openTestPdf } from "../utils/testPdf";

   function StatCard({ icon, value, label, color }) {
     return (
       <div
         className="rounded-2xl p-4 flex items-center gap-3"
         style={{ backgroundColor: color + "12", border: `1px solid ${color}35` }}
       >
         <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: color + "25" }}>
           {icon}
         </div>
         <div>
           <div className="font-hero font-bold text-xl leading-tight">{value}</div>
           <div className="text-xs text-base-content/50">{label}</div>
         </div>
       </div>
     );
   }

   function PublicTestCard({ test, onPractice, onDownload }) {
     return (
       <div className="practice-test-card card min-w-0 bg-base-100 p-5 shadow">
         <div className="mb-4 flex min-w-0 items-start justify-between gap-2">
           <div className="flex min-w-0 items-center gap-3">
             <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ backgroundColor: "#22C55E25" }}>&#127760;</div>
             <div className="min-w-0">
               <h3 className="truncate font-hero font-semibold">{test.title}</h3>
               <p className="text-xs text-base-content/40">Created on {new Date(test.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
             </div>
           </div>
           <span className="badge badge-sm shrink-0 badge-success gap-1">&#127760; Public</span>
         </div>
         <div className="mb-4 grid min-w-0 grid-cols-3 gap-2 text-sm">
           <div className="flex min-w-0 items-center gap-1.5"><span>&#128225;</span><div className="min-w-0"><div className="truncate font-medium text-xs">{test.timerMode}</div><div className="text-[10px] text-base-content/40">Timer Mode</div></div></div>
           <div className="flex min-w-0 items-center gap-1.5"><span>&#128339;</span><div className="min-w-0"><div className="font-medium text-xs">{test.secondsPerQuestion}s</div><div className="text-[10px] text-base-content/40">per question</div></div></div>
           <div className="flex min-w-0 items-center gap-1.5"><span>&#128203;</span><div className="min-w-0"><div className="font-medium text-xs">{test.questionCount}</div><div className="text-[10px] text-base-content/40">questions</div></div></div>
         </div>
         <div className="practice-test-actions grid grid-cols-2 gap-2">
           <button className="btn btn-sm min-w-0 gap-1 border-none bg-gradient-to-r from-indigo-500 to-purple-500 text-white" onClick={() => onPractice(test)}>Practice ({test.questionCount} coins)</button>
           <button type="button" className="btn btn-sm min-w-0 gap-1 btn-outline" onClick={() => onDownload(test)}>&#8681; Download PDF</button>
         </div>
       </div>
     );
   }
   export default function PublicTestsPage() {
     const { publicTests, fetchPublicTests } = useTestStore();
     const { stats, fetchStats } = useDashboardStore();
     const [search, setSearch] = useState("");
     const [sort, setSort] = useState("LATEST");
     const [selectedTest, setSelectedTest] = useState(null);
     const [showFreePracticeNotice, setShowFreePracticeNotice] = useState(true);
     const [visibleCount, setVisibleCount] = useState(4);
     const navigate = useNavigate();

     useEffect(() => {
       fetchPublicTests();
       fetchStats();
     }, []);

     useEffect(() => {
       setVisibleCount(4);
     }, [search, sort]);

     const filtered = publicTests
       .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
       .sort((a, b) =>
         sort === "LATEST"
           ? new Date(b.createdAt) - new Date(a.createdAt)
           : new Date(a.createdAt) - new Date(b.createdAt)
       );

     const visibleTests = filtered.slice(0, visibleCount);
     const hasMore = visibleCount < filtered.length;

     const confirmAndStart = () => {
       const testId = selectedTest.id;
       setSelectedTest(null);
       navigate(`/take-test/${testId}`);
     };

     const handleDownloadPdf = async (test) => {
       try { await openTestPdf(test.id); }
       catch (error) { window.alert(error.response?.data?.message || error.message || "Could not prepare this test PDF"); }
     };

     return (
       <div>
         {showFreePracticeNotice && (
           <div className="free-practice-notice fixed inset-x-4 top-5 z-[60] mx-auto max-w-md sm:inset-x-auto" role="status" aria-label="Free practice notice">
             <div className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 p-5 text-slate-800 shadow-2xl shadow-violet-900/25 dark:border-violet-300/25 dark:from-[#1d1742] dark:via-[#21164b] dark:to-[#321443] dark:text-white">
               <div className="pointer-events-none absolute -right-8 -top-10 text-7xl opacity-20" aria-hidden="true">&#10024;</div>
               <button type="button" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-lg text-slate-500 transition hover:bg-violet-200/60 hover:text-slate-800 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white" onClick={() => setShowFreePracticeNotice(false)} aria-label="Close free practice notice">&#215;</button>
               <div className="relative flex items-start gap-3 pr-7">
                 <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl shadow-lg shadow-violet-500/25" aria-hidden="true">&#127873;</div>
                 <div>
                   <p className="font-hero text-lg font-extrabold">Good news, learner!</p>
                   <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-violet-100">Currently all tests are free in this section. Keep practicing &amp; improving.</p>
                 </div>
               </div>
               <button type="button" className="relative mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:-translate-y-0.5 hover:brightness-110" onClick={() => setShowFreePracticeNotice(false)}>Let&apos;s practice <span className="ml-1">&#8594;</span></button>
             </div>
           </div>
         )}

         {/* Header */}
         <div className="relative rounded-2xl overflow-hidden mb-6 p-6 lg:p-8" style={{ background: "var(--hero-bg)" }}>
           <div className="relative z-10 flex items-center justify-between gap-6">
             <div>
               <h1 className="font-hero font-extrabold text-3xl text-white mb-1">
                 Practice{" "}
                 <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                   Others
                 </span>
               </h1>
               <p className="text-white/60 text-sm">Take tests the community has published and put your skills to the test.</p>
             </div>
             <div className="hidden lg:flex items-center gap-4">
               <div className="font-hand text-lg text-purple-300/70 leading-tight -rotate-2 text-right">
                 Explore<br />Compete<br />Learn<br />Together
               </div>
               <img src={docIllustration} alt="" className="w-28" />
             </div>
           </div>
         </div>

         {/* Stat cards */}
         <div className="grid sm:grid-cols-3 gap-4 mb-6">
           <StatCard icon="🌍" value={publicTests.length} label="Public Tests Available" color="#22C55E" />
           <StatCard icon="▶️" value={stats?.testsTaken ?? "..."} label="Tests Taken (all-time)" color="#3B82F6" />
           <StatCard icon="📊" value={stats ? `${stats.averageScorePercent}%` : "..."} label="Average Score" color="#A855F7" />
         </div>

         {/* Search + sort */}
         <div className="flex flex-col sm:flex-row gap-3 mb-6">
           <div className="flex items-center gap-2 bg-base-100 border border-base-300 rounded-lg px-3 py-2 flex-1">
             <span className="text-base-content/40">🔍</span>
             <input
               type="text" placeholder="Search public tests..."
               className="bg-transparent outline-none text-sm w-full"
               value={search} onChange={(e) => setSearch(e.target.value)}
             />
           </div>
           <select className="select select-bordered select-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
             <option value="LATEST">Latest First</option>
             <option value="OLDEST">Oldest First</option>
           </select>
         </div>

         {filtered.length === 0 ? (
           <div className="card bg-base-100 shadow p-10 text-center">
             <p className="text-base-content/50">
               {publicTests.length === 0 ? "No public tests yet — be the first to publish one!" : "No tests match your search."}
             </p>
           </div>
         ) : (
           <>
             <div className="grid min-w-0 gap-5 mb-4 xl:grid-cols-2">
               {visibleTests.map((test) => (
                 <PublicTestCard key={test.id} test={test} onPractice={setSelectedTest} onDownload={handleDownloadPdf} />
               ))}
             </div>

             {hasMore && (
               <div className="flex justify-center mb-6">
                 <button className="btn btn-outline gap-2" onClick={() => setVisibleCount((c) => c + 4)}>
                   Show More <span className="text-xs text-base-content/40">({filtered.length - visibleCount} remaining)</span>
                 </button>
               </div>
             )}
           </>
         )}

         {/* Bottom banner */}
         <div className="relative rounded-2xl overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "var(--hero-bg)" }}>
           <div className="flex items-center gap-3">
             <span className="text-2xl">🌍</span>
             <div>
               <h3 className="font-hero font-semibold text-white">Learn from the community!</h3>
               <p className="text-xs text-white/50">Score 100% on any paid test to get half your coins back automatically.</p>
             </div>
           </div>
           <p className="font-hand text-lg text-white/40 italic">"Progress looks good on you."</p>
         </div>

         {selectedTest && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md" onMouseDown={(e) => e.target === e.currentTarget && setSelectedTest(null)}>
             <section className="generated-test-modal relative w-full max-w-lg overflow-hidden rounded-3xl border border-violet-300/25 bg-gradient-to-br from-[#10162d] via-[#17213b] to-[#15132f] text-white shadow-2xl shadow-violet-950/60" role="dialog" aria-modal="true" aria-labelledby="practice-confirm-title">
               <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
               <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
               <div className="relative border-b border-white/10 px-6 pb-5 pt-6 sm:px-7">
                 <button type="button" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white" onClick={() => setSelectedTest(null)} aria-label="Close">&#215;</button>
                 <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[.18em] text-cyan-200"><span>&#10022;</span> Community practice</span>
                 <h3 id="practice-confirm-title" className="mt-4 font-hero text-2xl font-extrabold sm:text-3xl">Ready to practice?</h3>
                 <p className="mt-1 max-w-sm truncate text-sm text-slate-300">{selectedTest.title}</p>
               </div>
               <div className="relative p-6 sm:p-7">
                 <div className="grid grid-cols-2 gap-3">
                   <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><span className="text-xs uppercase tracking-wider text-slate-400">Questions</span><strong className="mt-1 block text-xl font-bold">{selectedTest.questionCount}</strong></div>
                   <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><span className="text-xs uppercase tracking-wider text-slate-400">Timer</span><strong className="mt-1 block text-xl font-bold">{selectedTest.secondsPerQuestion}s <span className="text-xs font-medium text-slate-400">/ question</span></strong></div>
                 </div>
                 <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-amber-300/25 bg-gradient-to-r from-amber-400/15 to-orange-400/10 p-4">
                   <div><p className="text-sm font-semibold text-amber-100">Practice cost</p><p className="mt-1 text-xs text-slate-300">1 coin per question</p></div>
                   <div className="flex items-center gap-2 text-right"><span className="text-2xl">&#129689;</span><strong className="text-2xl font-extrabold text-amber-300">{selectedTest.questionCount}</strong><span className="text-xs font-semibold text-amber-100">AG</span></div>
                 </div>
                 <div className="mt-3 flex gap-2 rounded-xl bg-emerald-400/10 px-3 py-2.5 text-xs leading-relaxed text-emerald-100"><span className="text-base">&#128161;</span><p>Score 100% and receive 50% of the coins back as cashback.</p></div>
                 <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                   <button type="button" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white" onClick={() => setSelectedTest(null)}>Maybe later</button>
                   <button type="button" className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 hover:brightness-110" onClick={confirmAndStart}>Start practicing <span className="ml-1">&#8594;</span></button>
                 </div>
               </div>
             </section>
           </div>
         )}
       </div>
     );
   }
