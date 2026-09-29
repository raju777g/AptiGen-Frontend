import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useDashboardStore } from "../store/dashboardStore";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";


const TOPIC_ICONS = {
  Programming: "💻", DSA: "🌳", DBMS: "🗄️", Networking: "📡",
  Aptitude: "🧠", Quantitative: "🔢", Logical: "🧩", Verbal: "📖",
};
const getTopicIcon = (topic) => TOPIC_ICONS[topic] || "📘";

const TOPIC_COLORS = ["#A855F7", "#3B82F6", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4", "#F97316", "#8B5CF6"];
const getTopicColor = (i) => TOPIC_COLORS[i % TOPIC_COLORS.length];



function StatCard({ icon, value, label, color }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: color + "12", border: `1px solid ${color}35` }}>
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

export default function SkillRadarPage() {
  const [mine, setMine] = useState(null);
  const [average, setAverage] = useState([]);
  const [chartMode, setChartMode] = useState("accuracy"); // "accuracy" | "questions"
  const [filter, setFilter] = useState("ALL"); // ALL | STRONG | WEAK
  const { stats, fetchStats } = useDashboardStore();

  const [topicSearch, setTopicSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    api.get("/analytics/skill-radar").then(({ data }) => setMine(Array.isArray(data) ? data : []));
    api.get("/analytics/skill-radar/average").then(({ data }) => setAverage(Array.isArray(data) ? data : []));
    fetchStats();
  }, []);

  useEffect(() => {
    setVisibleCount(4);
  }, [topicSearch, filter]);

  if (mine === null) {
    return <div className="flex justify-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  const filteredMine = mine.filter((d) =>
    filter === "ALL" ? true : filter === "STRONG" ? d.accuracyPercent >= 75 : d.accuracyPercent < 60
  );

  const breakdownList = filteredMine.filter((d) =>
    d.topic.toLowerCase().includes(topicSearch.toLowerCase())
  );
  const visibleBreakdown = breakdownList.slice(0, visibleCount);
  const hasMoreTopics = visibleCount < breakdownList.length;

  const averageByTopic = Object.fromEntries(average.map((a) => [a.topic, a.accuracyPercent]));

  const chartData = filteredMine.slice(0, 8).map((d) => ({
    topic: d.topic,
    you: chartMode === "accuracy" ? d.accuracyPercent : d.totalAnswered,
    avg: chartMode === "accuracy" ? (averageByTopic[d.topic] ?? 0) : undefined,
  }));

  const maxQuestions = Math.max(1, ...filteredMine.map((d) => d.totalAnswered));

  if (mine.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center">
        <div className="text-5xl mb-3">📊</div>
        <p className="text-base-content/50">Complete a test to see your skill breakdown here!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-6 lg:p-8" style={{ background: "var(--hero-bg)" }}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-hero font-extrabold text-3xl text-white mb-1">
              Your Skill{" "}
              <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Radar
              </span>
            </h1>
            <p className="text-white/60 text-sm">Track your strengths and identify areas to improve. Keep practicing to level up!</p>
          </div>
          <div className="flex gap-2">
            {[
              { key: "ALL", label: "All Topics" },
              { key: "STRONG", label: "Strong Areas" },
              { key: "WEAK", label: "Needs Practice" },
            ].map((f) => (
              <button
                key={f.key} onClick={() => setFilter(f.key)}
                className={`btn btn-sm rounded-full ${filter === f.key ? "text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards — no fake trend deltas, just real current values */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🎯" value={stats ? `${stats.averageScorePercent}%` : "..."} label="Overall Accuracy" color="#A855F7" />
        <StatCard icon="📄" value={stats?.testsTaken ?? "..."} label="Tests Completed" color="#3B82F6" />
        <StatCard icon="⚡" value={stats?.questionsSolved ?? "..."} label="Questions Solved" color="#22C55E" />
        <StatCard icon="🔥" value={stats ? `${stats.currentStreak} days` : "..."} label="Current Streak" color="#F59E0B" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Radar chart card */}
        <div className="card bg-base-100 shadow p-5">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📶</span>
              <h2 className="font-hero font-semibold">Skill Radar</h2>
            </div>
            <div className="flex gap-1 bg-base-200 rounded-full p-1">
              <button
                onClick={() => setChartMode("accuracy")}
                className={`btn btn-xs rounded-full ${chartMode === "accuracy" ? "btn-primary" : "btn-ghost"}`}
              >
                Accuracy
              </button>
              <button
                onClick={() => setChartMode("questions")}
                className={`btn btn-xs rounded-full ${chartMode === "questions" ? "btn-primary" : "btn-ghost"}`}
              >
                Questions
              </button>
              <button className="btn btn-xs rounded-full btn-ghost opacity-40" disabled title="Coming soon — per-question timing isn't tracked yet">
                Time Spent
              </button>
            </div>
          </div>
          <p className="text-xs text-base-content/50 mb-4">
            {chartMode === "accuracy" ? "Your accuracy vs. the platform average, by topic" : "Questions answered per topic"}
          </p>

          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="currentColor" className="text-base-300" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: "currentColor", fontSize: 12 }} />
              <PolarRadiusAxis
                angle={30}
                domain={chartMode === "accuracy" ? [0, 100] : [0, maxQuestions]}
                tick={{ fill: "currentColor", fontSize: 10 }}
              />
              <Radar name="Your Performance" dataKey="you" stroke="#A855F7" fill="#A855F7" fillOpacity={0.45} animationDuration={800} />
              {chartMode === "accuracy" && (
                <Radar name="Average Performance" dataKey="avg" stroke="#64748B" fill="#64748B" fillOpacity={0.15} animationDuration={800} />
              )}
            </RadarChart>
          </ResponsiveContainer>

          <div className="flex justify-center gap-6 mt-2 text-xs text-base-content/60">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#A855F7" }} /> Your Performance</span>
            {chartMode === "accuracy" && (
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#64748B" }} /> Average Performance</span>
            )}
          </div>
        </div>

        {/* Topic breakdown list */}
        <div className="card bg-base-100 shadow p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📋</span>
            <h2 className="font-hero font-semibold">Topic Breakdown</h2>
          </div>
          <p className="text-xs text-base-content/50 mb-3">Detailed performance in each topic</p>

          <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2 mb-3">
            <span className="text-base-content/40 text-sm">🔍</span>
            <input
              type="text" placeholder="Search topics..."
              className="bg-transparent outline-none text-sm w-full"
              value={topicSearch} onChange={(e) => setTopicSearch(e.target.value)}
            />
          </div>

          {breakdownList.length === 0 ? (
            <p className="text-sm text-base-content/40 text-center py-4">No topics match your search.</p>
          ) : (
            <>
              <div className="flex flex-col divide-y divide-base-200">
                {visibleBreakdown.map((d, i) => {
                  const color = getTopicColor(i);
                  return (
                    <div key={d.topic} className="py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: color + "22" }}>
                        {getTopicIcon(d.topic)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm truncate">{d.topic}</span>
                          <span className="font-hero font-bold text-sm shrink-0">{d.accuracyPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-base-200 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.accuracyPercent}%`, backgroundColor: color }} />
                        </div>
                        <p className="text-[10px] text-base-content/40 mt-1">{d.totalAnswered} questions answered</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMoreTopics && (
                <div className="flex justify-center mt-3">
                  <button className="btn btn-sm btn-outline gap-2" onClick={() => setVisibleCount((c) => c + 4)}>
                    Show More <span className="text-xs text-base-content/40">({breakdownList.length - visibleCount} remaining)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
