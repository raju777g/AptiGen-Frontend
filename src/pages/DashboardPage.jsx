   import { useEffect, useState } from "react";
   import { Link } from "react-router-dom";
   import { useAuthStore } from "../store/authStore";
   import { useWalletStore } from "../store/walletStore";
   import { useDashboardStore } from "../store/dashboardStore";
   import { useNotificationStore } from "../store/notificationStore";
   import { useTestStore } from "../store/testStore";
   import robotSmall from "../assets/robot-small.png";
   import dashboardBg from "../assets/dashBoard-bg-img.jpg";

   const dashboardPanelStyle = { "--dashboard-bg-image": `url(${dashboardBg})` };

   // Reuse the exact icons you already have for the sidebar nav items
   import iconGenerate from "../assets/icon-generate.png"; // adjust to your actual sidebar icon filenames
   import iconPractice from "../assets/icon-practice.png";
   import iconContests from "../assets/icon-contests.png";
   import iconSkillRadar from "../assets/icon-skillradar.png";
   // import iconRefer from "../assets/icon-refer.png";
   import iconCoins from "../assets/icon-coins.png";

   function moveSpotlight(event) {
     const rect = event.currentTarget.getBoundingClientRect();
     event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
     event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
   }

   function timeAgo(dateStr) {
     const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
     if (diff < 60) return "just now";
     if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
     if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
     return `${Math.floor(diff / 86400)}d ago`;
   }

   const transactionCopy = {
     SIGNUP_BONUS: { title: "Welcome bonus", place: "Added to your wallet", icon: "🎁" },
     PURCHASE: { title: "Coins purchased", place: "Added to your wallet", icon: "💳" },
     MCQ_GENERATION: { title: "Test generated", place: "AI test generation", icon: "✨" },
     TEST_ATTEMPT_PAID: { title: "Practice test", place: "Test attempt", icon: "📝" },
     ROYALTY_EARNED: { title: "Creator reward", place: "Test royalty", icon: "💎" },
     STREAK_BONUS: { title: "Streak reward", place: "Daily check-in", icon: "🔥" },
     ACCURACY_CASHBACK: { title: "Perfect-score cashback", place: "Test cashback", icon: "↩️" },
     REFERRAL_BONUS: { title: "Referral reward", place: "Referral bonus", icon: "🤝" },
     CONTEST_ENTRY: { title: "Contest entry", place: "Weekly contest", icon: "🏆" },
     CONTEST_PRIZE: { title: "Contest prize", place: "Weekly contest reward", icon: "🏅" },
     CONTEST_REFUND: { title: "Contest refund", place: "Returned to your wallet", icon: "↩️" },
   };

   function transactionDetails(transaction) {
     const copy = transactionCopy[transaction.type] || { title: "Coin transaction", place: "Wallet activity", icon: "🪙" };
     const reference = transaction.referenceId ? ` · Ref #${transaction.referenceId}` : "";
     return { ...copy, place: `${copy.place}${reference}` };
   }

   function StatCard({ icon, value, label, color }) {
     return (
       <div
         onPointerMove={moveSpotlight}
         className="dashboard-section-card spotlight rounded-2xl p-4 flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5"
         style={{ backgroundColor: color + "12", border: `1px solid ${color}35` }}
       >
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: color + "25" }}>
             {icon}
           </div>
           <div>
             <div className="font-hero font-bold text-xl leading-tight">{value}</div>
             <div className="text-xs text-base-content/50">{label}</div>
           </div>
         </div>
       </div>
     );
   }

   function QuickAction({ to, icon, title, desc, color }) {
     return (
       <Link
         to={to}
         onPointerMove={moveSpotlight}
         className="dashboard-quick-action spotlight group rounded-2xl p-4 text-white transition-transform duration-300 hover:-translate-y-1"
         style={{ background: color }}
       >
         <div className="dashboard-quick-action-head flex items-center justify-between mb-3">
           <img src={icon} alt="" className="w-6 h-6" />
           <span className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center text-xs transition-transform group-hover:translate-x-0.5">
             →
           </span>
         </div>
         <div className="dashboard-quick-action-copy">
           <div className="font-hero font-semibold text-sm mb-0.5">{title}</div>
           <div className="text-xs text-white/70">{desc}</div>
         </div>
       </Link>
     );
   }

   function ProgressRing({ percent, label, valueLabel, color }) {
     const radius = 34;
     const circumference = 2 * Math.PI * radius;
     const offset = circumference - (percent / 100) * circumference;

     return (
       <div className="flex flex-col items-center">
         <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
           <circle cx="44" cy="44" r={radius} stroke="currentColor" className="text-base-300" strokeWidth="7" fill="none" />
           <circle
             cx="44" cy="44" r={radius} stroke={color} strokeWidth="7" fill="none"
             strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
             style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
           />
         </svg>
         <div className="-mt-14 mb-8 font-hero font-bold text-lg">{valueLabel}</div>
         <span className="text-xs text-base-content/50 mt-1">{label}</span>
       </div>
     );
   }

   export default function DashboardPage() {
     const user = useAuthStore((s) => s.user);
     const balance = useWalletStore((s) => s.balance);
     const transactions = useWalletStore((s) => s.transactions);
     const fetchWallet = useWalletStore((s) => s.fetchWallet);
     const { stats, fetchStats } = useDashboardStore();
     const { fetchAll } = useNotificationStore();
     const { myTests, fetchMyTests } = useTestStore();
     const [transactionPage, setTransactionPage] = useState(0);
     const transactionPageSize = 5;
     const transactionPageCount = Math.max(1, Math.ceil(transactions.length / transactionPageSize));

     useEffect(() => {
       setTransactionPage((page) => Math.min(page, transactionPageCount - 1));
     }, [transactions.length, transactionPageCount]);

     useEffect(() => {
       fetchStats();
       fetchWallet();
       fetchAll();
       fetchMyTests();
     }, []);

     const weekStart = new Date();
     weekStart.setHours(0, 0, 0, 0);
     weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
     const weekEnd = new Date(weekStart);
     weekEnd.setDate(weekEnd.getDate() + 7);
     const dailyTestCounts = Array(7).fill(0);
     myTests.forEach((test) => {
       const createdAt = new Date(test.createdAt);
       if (Number.isNaN(createdAt.getTime()) || createdAt < weekStart || createdAt >= weekEnd) return;
       const dayIndex = (createdAt.getDay() + 6) % 7;
       dailyTestCounts[dayIndex] += 1;
     });
     const maxDailyTests = Math.max(...dailyTestCounts, 1);

     return (
       <div className="dashboard-page">
         {/* Welcome banner */}
         <div onPointerMove={moveSpotlight} className="dashboard-welcome spotlight relative rounded-2xl overflow-hidden mb-6 p-6 lg:p-8" style={{ background: "var(--hero-bg)" }}>
           <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
             <div>
               <p className="text-white/60 text-sm mb-1">Good to see you back! 👋</p>
               <h1 className="font-hero font-extrabold text-2xl lg:text-3xl text-white mb-1">
                 Welcome, <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{user?.name || user?.email}</span>
               </h1>
               <p className="text-white/40 text-sm italic">"Small steps every day make big results."</p>
             </div>
             <div className="hidden lg:flex items-center gap-3">
               <div className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white/90 max-w-[180px]">
                 Let's make today productive! ✨
               </div>
               <img src={robotSmall} alt="" className="w-24" />
             </div>
           </div>
         </div>

         <div className="dashboard-sections-bg" style={dashboardPanelStyle}>
         {/* Stat cards */}
         <div className="dashboard-stats grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <StatCard icon="📘" value={stats?.testsTaken ?? "..."} label="Tests Taken" color="#3B82F6" />
           <StatCard icon="🎯" value={stats ? `${stats.averageScorePercent}%` : "..."} label="Average Score" color="#EC4899" />
           <StatCard icon="🏆" value={stats?.contestsJoined ?? "..."} label="Contests Joined" color="#F59E0B" />
           <div onPointerMove={moveSpotlight} className="dashboard-section-card spotlight rounded-2xl p-4 flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5" style={{ backgroundColor: "#E8A93B12", border: "1px solid #E8A93B35" }}>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: "#E8A93B25" }}>🪙</div>
               <div>
                 <div className="font-hero font-bold text-xl leading-tight">{balance ?? "..."}</div>
                 <div className="text-xs text-base-content/50">Coins Balance</div>
               </div>
             </div>
             <Link to="/buy-coins" className="btn btn-xs" style={{ backgroundColor: "var(--amber)", color: "var(--ink)", border: "none" }}>
               Buy Coins →
             </Link>
           </div>
         </div>

         <div className="dashboard-main-grid grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-6">
           {/* Quick Actions */}
           <div onPointerMove={moveSpotlight} className="dashboard-section-card spotlight card shadow p-5">
             <div className="flex items-center gap-2 mb-1">
               <span className="text-lg">⚡</span>
               <h2 className="font-hero font-semibold">Quick Actions</h2>
             </div>
             <p className="text-xs text-base-content/50 mb-4">Start learning in seconds</p>
             <div className="dashboard-quick-grid grid sm:grid-cols-3 gap-3">
               <QuickAction to="/generate" icon={iconGenerate} title="Generate Test" desc="Create AI-powered tests instantly" color="linear-gradient(135deg,#6366F1,#8B5CF6)" />
               <QuickAction to="/practice" icon={iconPractice} title="Practice Others" desc="Solve community tests" color="linear-gradient(135deg,#3B82F6,#06B6D4)" />
               <QuickAction to="/contests" icon={iconContests} title="Join Contest" desc="Compete & earn rewards" color="linear-gradient(135deg,#EC4899,#A855F7)" />
               <QuickAction to="/skill-radar" icon={iconSkillRadar} title="View Skill Radar" desc="Analyze your strengths" color="linear-gradient(135deg,#22C55E,#16A34A)" />
               {/* Referral program disabled for now.
               <QuickAction to="/referral" icon={iconRefer} title="Invite Friends" desc="Earn bonus coins" color="linear-gradient(135deg,#F97316,#EA580C)" />
               */}
               <QuickAction to="/buy-coins" icon={iconCoins} title="Buy Coins" desc="Get more practice" color="linear-gradient(135deg,#6366F1,#8B5CF6)" />
             </div>
           </div>

           {/* Your Progress */}
           <div onPointerMove={moveSpotlight} className="dashboard-section-card spotlight card shadow p-5">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <span className="text-lg">📈</span>
                 <h2 className="font-hero font-semibold">Your Progress</h2>
               </div>
               <Link to="/skill-radar" className="btn btn-xs btn-ghost">View Details →</Link>
             </div>
       <div className="dashboard-progress-rings flex justify-around mb-4">
               <ProgressRing percent={stats?.averageScorePercent ?? 0} valueLabel={`${stats?.averageScorePercent ?? 0}%`} label="Average Score" color="#22C55E" />
               <ProgressRing percent={stats ? Math.min(100, (stats.testsTaken / 20) * 100) : 0} valueLabel={`${stats?.testsTaken ?? 0}/20`} label="Tests Completed" color="#3B82F6" />
               <ProgressRing percent={stats ? Math.min(100, (stats.currentStreak / 7) * 100) : 0} valueLabel={`${stats?.currentStreak ?? 0}d`} label="Current Streak" color="#E8A93B" />
             </div>
             <div className="dashboard-weekly-chart flex justify-between items-end h-16 px-1" aria-label="Tests generated each day this week">
               {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => (
                 <div key={day} className="dashboard-week-day flex flex-col items-center gap-1" title={`${dailyTestCounts[i]} ${dailyTestCounts[i] === 1 ? "test" : "tests"} generated on ${day}`}>
                   <span className="dashboard-week-count">{dailyTestCounts[i]}</span>
                   <div className="dashboard-week-bar rounded-t" style={{ height: `${dailyTestCounts[i] ? Math.max(8, (dailyTestCounts[i] / maxDailyTests) * 56) : 4}px`, backgroundColor: i === (new Date().getDay() + 6) % 7 ? "var(--amber)" : "var(--slate)", opacity: dailyTestCounts[i] ? 0.88 : 0.24 }} />
                   <span className="dashboard-week-label text-[9px] text-base-content/40">{day}</span>
                 </div>
               ))}
             </div>
           </div>
         </div>

         {/* Coin activity */}
         <div onPointerMove={moveSpotlight} className="dashboard-section-card spotlight card shadow p-5 mb-6">
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
               <span className="text-lg">🕐</span>
               <div><h2 className="font-hero font-semibold">Coin activity</h2><p className="text-xs text-base-content/50">Every credit and where your AG coins were spent</p></div>
             </div>
             {transactionPageCount > 1 && <span className="text-xs text-base-content/50">Page {transactionPage + 1} of {transactionPageCount}</span>}
           </div>
           {transactions.length === 0 ? (
             <p className="text-sm text-base-content/40 text-center py-4">No coin transactions yet.</p>
           ) : (
             <div className="flex flex-col divide-y divide-base-200">
               {transactions.slice(transactionPage * transactionPageSize, (transactionPage + 1) * transactionPageSize).map((transaction) => (
               <div key={transaction.id || `${transaction.type}-${transaction.createdAt}`} className="dashboard-activity-row flex items-center justify-between py-3" style={{ display: "grid", gridTemplateColumns: "2.8rem minmax(0, 1fr) auto", alignItems: "center" }}>
                 <div className="dashboard-activity-icon" aria-hidden="true">{transactionDetails(transaction).icon}</div>
                 <div className="dashboard-activity-copy">
                   <p className="text-sm font-medium">{transactionDetails(transaction).title}</p>
                   <p className="text-xs text-base-content/50">{transactionDetails(transaction).place} · {timeAgo(transaction.createdAt)}</p>
                   </div>
                   <span className={`text-sm font-semibold whitespace-nowrap ml-3 ${Number(transaction.amount) < 0 ? "text-rose-300" : "text-emerald-300"}`}>{Number(transaction.amount) > 0 ? "+" : ""}{transaction.amount} AG</span>
                 </div>
               ))}
             </div>
           )}
           {transactionPageCount > 1 && <div className="mt-4 flex items-center justify-between border-t border-base-200 pt-3">
             <button type="button" className="btn btn-sm btn-ghost" disabled={transactionPage === 0} onClick={() => setTransactionPage((page) => Math.max(0, page - 1))}>← Previous</button>
             <span className="text-xs text-base-content/50">Showing {transactionPage * transactionPageSize + 1}–{Math.min((transactionPage + 1) * transactionPageSize, transactions.length)} of {transactions.length}</span>
             <button type="button" className="btn btn-sm btn-ghost" disabled={transactionPage >= transactionPageCount - 1} onClick={() => setTransactionPage((page) => Math.min(transactionPageCount - 1, page + 1))}>Next →</button>
           </div>}
         </div>

         </div>

         {/* Bottom CTA banner */}
         <div onPointerMove={moveSpotlight} className="dashboard-cta spotlight relative rounded-2xl overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "var(--hero-bg)" }}>
           <div className="flex items-center gap-3">
             <span className="text-2xl">🎯</span>
             <div>
               <h3 className="font-hero font-semibold text-white">Stay Consistent, Keep Growing!</h3>
               <p className="text-xs text-white/50">Practice today. A better version of you is waiting tomorrow.</p>
             </div>
           </div>
           <Link to="/generate" className="btn text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 whitespace-nowrap">
             Generate a Test Now →
         </Link>
       </div>
       </div>
     );
   }
