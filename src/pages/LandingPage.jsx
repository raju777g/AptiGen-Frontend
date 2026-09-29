import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.png";
import heroRobot from "../assets/hero-robot.png";
import robotSmall from "../assets/robot-small.png";
import iconPractice from "../assets/icon-practice.png";
import iconEarn from "../assets/icon-earn.png";
import iconStreak from "../assets/icon-streak.png";
import iconCashback from "../assets/icon-cashback.png";
import iconContests from "../assets/icon-contests.png";
// import iconRefer from "../assets/icon-refer.png";

function DemoTestCard() {
    const [seconds, setSeconds] = useState(47);
    const [selected, setSelected] = useState("O(log n)");

    useEffect(() => {
        const t = setInterval(() => setSeconds((s) => (s <= 1 ? 47 : s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    const options = ["O(n)", "O(log n)", "O(n log n)", "O(1)"];

    return (
        <div className="relative">
            {/* floating subject badges — decorative, matches the reference's pill cluster */}
            <div className="hidden lg:flex flex-col gap-2 absolute -right-32 top-4 z-10">
                {[
                    { label: "Math", color: "#6366F1" },
                    { label: "CS", color: "#A855F7" },
                    { label: "Physics", color: "#EC4899" },
                    { label: "Reasoning", color: "#22C55E" },
                ].map((b) => (
                    <span
                        key={b.label}
                        className="text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg"
                        style={{ backgroundColor: b.color }}
                    >
                        {b.label}
                    </span>
                ))}
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-white/50">Question 3 of 10</span>
                    <span className="flex items-center gap-1 font-hero font-bold text-sm px-3 py-1.5 rounded-full bg-amber-400/90 text-slate-900">
                        ⏱ {seconds}s
                    </span>
                </div>
                <p className="text-white font-medium mb-4">What is the time complexity of binary search?</p>
                <div className="flex flex-col gap-2">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setSelected(opt)}
                            className={`btn btn-sm justify-start font-mono border-white/10 ${selected === opt
                                ? "text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500"
                                : "bg-white/5 text-white/80 hover:bg-white/10"
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-5">
                    <button className="btn btn-sm bg-white/5 text-white/70 border-white/10">← Previous</button>
                    <button className="btn btn-sm text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500">Next →</button>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="min-h-screen" style={{ background: "var(--hero-bg)" }}>
            {/* Nav */}
            <div style={{ background: "var(--hero-bg)" }} className="relative overflow-hidden">
                {/* Nav */}
                <nav className="flex items-center justify-between px-6 lg:px-12 py-5 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧠</span>
                        <span className="font-hero font-bold text-xl text-white">AptiGen</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-1.5 py-1.5">
                        <a href="#" className="text-sm font-medium text-white bg-white/10 rounded-full px-4 py-1.5">Home</a>
                        <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-1.5">Features</a>
                        <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-1.5">How it works</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn btn-sm bg-white/5 text-white border-white/10 hover:bg-white/10">Log in</Link>
                        <Link to="/register" className="btn btn-sm text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500">Sign Up</Link>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative px-6 lg:px-12 pt-6 pb-16 grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto z-10">
                    <div className="hidden lg:block absolute left-6 top-2 font-hand text-xl text-white/60 leading-tight -rotate-2">
                        Turn Your Notes<br />Into Progress
                    </div>
                    <div className="hidden lg:block absolute right-6 top-2 font-hand text-xl text-amber-300/70 leading-tight rotate-6 text-right">
                        Study Smarter<br />Not Harder
                    </div>

                    <div className="pt-10 lg:pt-16">
                        <h1 className="font-hero font-extrabold text-4xl lg:text-5xl leading-[1.1] mb-4 text-white">
                            Study Smarter with{" "}
                            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                AptiGen
                            </span>
                        </h1>
                        <p className="text-white/60 text-lg mb-7 max-w-md">
                            Upload your study material, get instant AI-generated tests, and track your progress — all in one place.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-6">
                            <Link to="/register" className="btn btn-lg text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500">
                                Get Started →
                            </Link>
                            <a href="#how-it-works" className="btn btn-lg bg-white/5 text-white border-white/15 hover:bg-white/10">
                                ▶ Watch Demo
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-5 text-sm text-white/50">
                            <span className="flex items-center gap-1.5">⚡ AI Powered</span>
                            <span className="flex items-center gap-1.5">📚 Any Subject</span>
                            <span className="flex items-center gap-1.5">📈 Track Progress</span>
                        </div>
                    </div>

                    <div className="relative flex justify-center pt-10 lg:pt-0">
                        <img src={heroRobot} alt="AptiGen AI study companion" className="w-85 lg:w-135 relative z-10" />

                        {/* floating subject tags around the robot — desktop only */}
                        <span className="hidden lg:flex items-center gap-1 absolute top-4 left-0 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg bg-blue-500/90 backdrop-blur-sm">
                            {"</>"} Coding
                        </span>
                        <span className="hidden lg:flex items-center gap-1 absolute top-20 -left-6 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg bg-indigo-500/90 backdrop-blur-sm">
                            √x Math
                        </span>
                        <span className="hidden lg:flex items-center gap-1 absolute top-8 right-0 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg bg-purple-500/90 backdrop-blur-sm">
                            🧠 AI Powered
                        </span>
                        <span className="hidden lg:flex items-center gap-1 absolute bottom-14 right-0 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg bg-cyan-500/90 backdrop-blur-sm">
                            📊 Better Results
                        </span>

                        <div className="hidden lg:block absolute -right-16 bottom-0 font-hand text-lg text-white/50 rotate-3">
                            Your AI<br />Learning Companion
                        </div>
                    </div>
                </section>

                {/* How it works — same dark bg, continuous with hero, no white break */}
                <section id="how-it-works" className="relative px-6 lg:px-12 pb-20 max-w-5xl mx-auto text-center z-10">
                    <span className="inline-block text-xs font-semibold tracking-wide text-purple-300 bg-purple-500/15 border border-purple-400/20 rounded-full px-4 py-1.5 mb-4">
                        HOW IT WORKS
                    </span>
                    <h2 className="font-hero font-bold text-3xl mb-2 text-white">
                        How it <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>works</span>
                    </h2>
                    <p className="text-white/50 mb-14">From photo to progress — in just 3 simple steps.</p>

                    <div className="grid md:grid-cols-3 gap-6 relative">
                        <div className="hidden md:block absolute top-10 left-[18%] right-[18%] border-t-2 border-dashed border-white/20 z-0" />

                        {[
                            { num: 1, icon: "📸", title: "Upload a photo", desc: "Any set of MCQs and answers — a screenshot, a textbook page, your own notes.", cta: "Upload Now", color: "#3B82F6" },
                            { num: 2, icon: "⚡", title: "Get an instant test", desc: "AI extracts the questions and builds a timed mock test automatically.", cta: "Try a Sample", color: "#A855F7" },
                            { num: 3, icon: "📊", title: "Track your accuracy", desc: "See exactly where you're strong and where you need more practice, by topic.", cta: "View Progress", color: "#22C55E" },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="relative z-10 rounded-2xl p-6 text-left backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                                style={{ backgroundColor: step.color + "12", border: `1px solid ${step.color}40` }}
                            >
                                <span
                                    className="absolute -top-4 left-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
                                    style={{ backgroundColor: step.color }}
                                >
                                    {step.num}
                                </span>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 mt-2" style={{ backgroundColor: step.color + "22" }}>
                                    {step.icon}
                                </div>
                                <h3 className="font-hero font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-white/50 mb-5">{step.desc}</p>
                                <Link
                                    to="/register"
                                    className="text-sm font-medium text-white inline-flex items-center gap-1 px-4 py-2 rounded-lg transition-colors"
                                    style={{ backgroundColor: step.color + "22" }}
                                >
                                    {step.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Stats row — placeholders until you have real numbers */}
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 mt-16 text-white/70">
                        {[
                            { icon: "🎓", value: "Early Access", label: "Join the first cohort" },
                            { icon: "⚡", value: "AI-Powered", label: "Instant test generation" },
                            { icon: "💙", value: "Made for", label: "Curious learners" },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2 text-sm">
                                <span className="text-lg">{s.icon}</span>
                                <div className="text-left">
                                    <div className="font-semibold text-white">{s.value}</div>
                                    <div className="text-white/40 text-xs">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            

            {/* Features grid */}
            <section id="features" className="relative px-6 lg:px-12 py-16 lg:py-20 overflow-hidden" style={{ background: "var(--hero-bg)" }}>
                <div className="hidden lg:block absolute left-10 top-10 font-hand text-2xl text-white/60 leading-tight -rotate-2">
                    Learn<br />Practice<br />Improve<br />Repeat
                </div>
                <div className="hidden lg:block absolute right-10 top-1/2 font-hand text-xl text-purple-300/50 leading-tight rotate-2 text-right">
                    More Practice<br />More Possibilities
                </div>
                <div className="hidden lg:block absolute left-10 bottom-10 font-hand text-xl text-white/40 leading-tight -rotate-3">
                    Better Students<br />Brighter Futures
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <p className="text-xs font-semibold tracking-widest text-white/40 mb-3">PRACTICE · IMPROVE · GROW</p>
                    <h2 className="font-hero font-bold text-3xl mb-2 text-white">
                        Built to keep you{" "}
                        <span className="relative inline-block">
                            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                practicing
                            </span>
                            <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                                <path d="M0,4 Q50,0 100,4" stroke="#A855F7" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-white/50 mb-4">Everything you need to practice, compete, and grow — all in one place.</p>

                    {/* robot speech bubble, floats top-right on desktop */}
                    <div className="hidden lg:flex items-center gap-2 absolute -top-2 right-0">
                        <div className="relative bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 py-2.5 text-sm text-white/90 max-w-[180px]">
                            Small steps every day make big results! ✨
                        </div>
                        <img src={robotSmall} alt="" className="w-20" />
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                        {[
                            { icon: iconPractice, title: "Practice others' tests", desc: "Browse tests the community has published and take them for a small coin cost.", tag: "Community Tests", color: "#3B82F6" },
                            { icon: iconEarn, title: "Earn from your tests", desc: "Publish your own generated tests and earn a royalty every time someone takes them.", tag: "Turn Knowledge Into Rewards", color: "#E8A93B" },
                            { icon: iconStreak, title: "Daily streaks", desc: "Check in daily for bonus coins — the longer your streak, the bigger the reward.", tag: "Build Your Streak", color: "#F97316" },
                            { icon: iconCashback, title: "Perfect-score cashback", desc: "Score 100% on a paid test and get half your coins back automatically.", tag: "Practice Risk-Free", color: "#EC4899" },
                            { icon: iconContests, title: "Weekly contests", desc: "Compete every Sunday for bonus coins against the whole AptiGen community.", tag: "Compete & Climb", color: "#F59E0B" },
                            // Referral program disabled for now.
                            // { icon: iconRefer, title: "Refer & earn", desc: "Invite a friend — you both get 20 bonus coins once they verify their account.", tag: "Learn Together", color: "#22C55E" },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="group relative text-left rounded-2xl p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                                style={{ backgroundColor: f.color + "0F", border: `1px solid ${f.color}35` }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <img src={f.icon} alt="" className="w-11 h-11" />
                                    <span
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-transform group-hover:translate-x-0.5"
                                        style={{ border: `1px solid ${f.color}60`, color: f.color }}
                                    >
                                        →
                                    </span>
                                </div>
                                <h3 className="font-hero font-semibold text-white mb-1">{f.title}</h3>
                                <p className="text-sm text-white/50 mb-4">{f.desc}</p>
                                <span
                                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
                                    style={{ backgroundColor: f.color + "22", color: f.color }}
                                >
                                    {f.tag}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="font-hand text-2xl text-white/50 mt-14">"Progress looks good on you."</p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 lg:px-12 py-16 bg-base-200">
                <div
                    className="relative max-w-5xl mx-auto rounded-3xl px-8 py-14 text-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1A1042, #3B1F6B)" }}
                >
                    <div
                        className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none"
                        style={{ background: "linear-gradient(135deg, #A855F7, #6366F1)" }}
                    />
                    <div className="relative z-10">
                        <span className="inline-block text-xs font-semibold tracking-wide text-purple-200 bg-white/10 rounded-full px-4 py-1.5 mb-4">
                            JOIN APTIGEN TODAY
                        </span>
                        <h2 className="font-hero font-bold text-3xl mb-3 text-white">
                            Ready to turn your notes into{" "}
                            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                practice tests
                            </span>?
                        </h2>
                        <p className="text-white/60 mb-8">Start free, earn coins as you go, and build a habit that actually sticks.</p>

                        <Link
                            to="/register"
                            className="btn btn-lg text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 bg-[length:200%_100%] bg-left hover:bg-right transition-[background-position] duration-500"
                        >
                            Get Started — It's Free →
                        </Link>

                        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12 text-white/70 text-sm">
                            {[
                                { icon: "📸", label: "Photo → Test in seconds" },
                                { icon: "🏆", label: "New contest every week" },
                                { icon: "🎁", label: "Earn coins as you practice" },
                                { icon: "🔒", label: "No credit card to sign up" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-2">
                                    <span>{s.icon}</span>
                                    <span>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <footer className="px-6 lg:px-12 py-6 text-center text-xs text-base-content/40 bg-base-200">
                © 2026 AptiGen
            </footer>
        </div>
    );
}
