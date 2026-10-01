import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import regRobotImg from "../assets/reg-robot-img.png";
import googleLogo from "../assets/google.png";
import githubLogo from "../assets/github.png";
import logoMark from "../assets/logo-mark.png";
import emailIcon from "../assets/register-login-logos/email.png";
import profileIcon from "../assets/register-login-logos/profile.png";
import passIcon from "../assets/register-login-logos/pass.png";
import visibleIcon from "../assets/register-login-logos/visible.png";
import hideIcon from "../assets/register-login-logos/hide1.png";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Too short", "Weak", "Fair", "Good", "Strong", "Strong"];
  const colors = ["#C1483A", "#C1483A", "#F59E0B", "#F59E0B", "#22C55E", "#22C55E"];
  return { score, label: labels[score], color: colors[score] };
}

export default function RegisterPage() {
  // Referral program disabled for now.

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const busyRef = useRef(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const register = useAuthStore((s) => s.register);
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendVerificationCode = useAuthStore((s) => s.resendVerificationCode);
  const navigate = useNavigate();

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setResendCooldown((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const resendCountdown = `${String(Math.floor(resendCooldown / 60)).padStart(2, "0")}:${String(resendCooldown % 60).padStart(2, "0")}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busyRef.current) return;
    // FormData includes values supplied by mobile autofill even when React's
    // change handler was not triggered.
    const formData = new FormData(e.currentTarget);
    const submittedName = String(formData.get("name") || name).trim();
    const submittedEmail = String(formData.get("email") || email).trim().toLowerCase();
    const submittedPassword = String(formData.get("password") || password);
    busyRef.current = true;
    setError("");
    setBusy(true);
    setBusyAction("register");
    try {
      setName(submittedName);
      setEmail(submittedEmail);
      setPassword(submittedPassword);
      await register(submittedName, submittedEmail, submittedPassword);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.message) setError(data.message);
      else if (data?.errors) setError(Object.values(data.errors)[0]);
      else setError("Registration failed. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      setBusyAction("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setError("");
    setBusy(true);
    setBusyAction("verify");
    try {
      await verifyEmail(email, verificationCode);
      navigate("/login?verified=1");
    } catch (err) {
      setError(err.response?.data?.message || "That code is invalid or expired. Try again or request a new one.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      setBusyAction("");
    }
  };

  const handleResendCode = async () => {
    if (busyRef.current || resendCooldown > 0) return;
    busyRef.current = true;
    setError("");
    setNotice("");
    setBusy(true);
    setBusyAction("resend");
    try {
      await resendVerificationCode(email);
      setVerificationCode("");
      setNotice("If this account is awaiting verification, a new code has been sent. Check your inbox.");
      setResendCooldown(120);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't resend the code. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      setBusyAction("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--magic-gradient)" }}>
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: marketing copy + robot, stacked */}
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-purple-200 bg-purple-500/15 border border-purple-400/25 rounded-full px-4 py-1.5 mb-5">
            🚀 AI-Powered Learning Platform
          </span>

          <h1 className="font-hero font-extrabold text-4xl leading-tight text-white mb-4">
            Learn{" "}
            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Smarter
            </span>
            <br />with AptiGen
          </h1>
          <p className="text-white/60 mb-8 max-w-md">
            Create your account and unlock a personalized AI-powered learning experience
            designed to help you{" "}
            <span className="text-purple-300 font-medium">grow faster</span>.
          </p>

          <div className="flex justify-center">
            <img src={regRobotImg} alt="AptiGen AI assistant" className="w-full max-w-sm object-contain" />
          </div> <br></br>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: "⚡", title: "AI-Powered Tests", desc: "Generate topic-wise mock tests in seconds.", color: "#A855F7" },
              { icon: "📊", title: "Track Your Progress", desc: "Get detailed analytics and skill radar.", color: "#3B82F6" },
              { icon: "📖", title: "Learn from Practice", desc: "Explore questions, solutions and improve continuously.", color: "#F59E0B" },
              { icon: "🏆", title: "Contests & Challenges", desc: "Compete with others and level up your skills.", color: "#22C55E" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl p-4" style={{ backgroundColor: f.color + "12", border: `1px solid ${f.color}30` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-2" style={{ backgroundColor: f.color + "30" }}>
                  {f.icon}
                </div>
                <div className="text-white text-sm font-semibold">{f.title}</div>
                <div className="text-white/50 text-xs mt-0.5">{f.desc}</div>
              </div>
            ))}
          </div>


        </div>

        {/* Glass form card */}
        <div
          className="w-full max-w-md mx-auto rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          style={{ backgroundColor: "rgba(15,10,40,0.72)", border: "1px solid rgba(168,85,247,0.35)" }}
        >
          {done ? (
            <div className="text-center">
              <div className="text-5xl mb-3">📬</div>
              <h2 className="font-hero font-bold text-xl text-white mb-2">Verify your email</h2>
              <p className="text-white/60 text-sm">
                Enter the 6-digit code sent to <b>{email}</b>. It expires in 10 minutes.
              </p>
              {notice && <div role="status" className="text-sm mb-4 rounded-lg px-3 py-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-200">{notice}</div>}
              {error && <div role="status" className="text-sm mb-4 rounded-lg px-3 py-2 bg-red-500/15 border border-red-400/30 text-red-200">{error}</div>}
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required aria-label="Six-digit email verification code" placeholder="000000" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="input w-full bg-white/5 border-white/15 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/25" />
                <button type="submit" disabled={busy || verificationCode.length !== 6} aria-busy={busy} className="btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 disabled:opacity-70">
                  {busyAction === "verify" ? <><span className="loading loading-spinner loading-sm" aria-hidden="true" /> Verifying...</> : "Verify email"}
                </button>
              </form>
              <div className="flex items-center justify-between mt-5 text-sm">
                <button type="button" disabled={busy || resendCooldown > 0} onClick={handleResendCode} aria-busy={busy} className="inline-flex items-center gap-2 text-purple-300 hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                  {busyAction === "resend" ? <><span className="loading loading-spinner loading-xs" aria-hidden="true" /> Sending...</> : resendCooldown > 0 ? `Resend in ${resendCountdown}` : "Resend code"}
                </button>
                <button type="button" disabled={busy} onClick={() => { setDone(false); setError(""); }} className="text-white/50 hover:text-white disabled:opacity-50">Change details</button>
              </div>
              {resendCooldown > 0 && <p className="mt-3 text-center text-xs text-white/45">You can request another code in {resendCountdown}.</p>}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-5">
                <img src={logoMark} alt="AptiGen" className="h-8 w-8" />
                <span className="font-hero font-bold text-2xl text-white">AptiGen</span>
              </div>

              <h1 className="text-center font-hero font-bold text-xl text-white mb-1">
                Create your <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AptiGen</span> account
              </h1>
              <p className="text-center text-white/50 text-sm mb-6">Start your AI-powered learning journey today</p>

              {/* Decorative step indicator — this is a single-step form underneath */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {[
                  { num: 1, label: "Register" },
                  { num: 2, label: "Verify" },
                  { num: 3, label: "Get Started" },
                ].map((s, i, arr) => (
                  <div key={s.num} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= (done ? 1 : 0) ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-white/10 text-white/40"
                          }`}
                      >
                        {s.num}
                      </span>
                      <span className="text-[10px] text-white/40 mt-1">{s.label}</span>
                    </div>
                    {i < arr.length - 1 && <div className="w-8 h-px bg-white/15 mb-4" />}
                  </div>
                ))}
              </div>

              {/* Referral program disabled for now.
              {referralCode && (
                <div className="text-sm mb-4 rounded-lg px-3 py-2 bg-purple-500/15 border border-purple-400/30 text-purple-200">
                  🎁 Referred by code <b>{referralCode}</b> — you'll both get 20 coins on verification!
                </div>
              )}
              */}
              {error && (
                <div className="text-sm mb-4 rounded-lg px-3 py-2 bg-red-500/15 border border-red-400/30 text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                {/* Full Name */}
                <label className="input bg-white/5 border-white/15 text-white flex items-center gap-3">

                  <img
                    src={profileIcon}
                    alt="Profile"
                    className="w-5 h-5 object-contain opacity-80"
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    required
                    autoComplete="name"
                    className="grow bg-transparent outline-none placeholder:text-white/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                </label>


                {/* Email */}
                <label className="input bg-white/5 border-white/15 text-white flex items-center gap-3">

                  <img
                    src={emailIcon}
                    alt="Email"
                    className="w-5 h-5 object-contain opacity-80"
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="grow bg-transparent outline-none placeholder:text-white/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </label>


                {/* Password */}
                <label className="input bg-white/5 border-white/15 text-white flex items-center gap-3">

                  <img
                    src={passIcon}
                    alt="Password"
                    className="w-5 h-5 object-contain opacity-80"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password (min 6 characters)"
                    required
                    autoComplete="new-password"
                    className="grow bg-transparent outline-none placeholder:text-white/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* Password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <img
                      src={showPassword ? hideIcon : visibleIcon}
                      alt={showPassword ? "Hide password" : "Show password"}
                      className="w-5 h-5 object-contain"
                    />
                  </button>

                </label>


                {password && (
                  <div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors duration-300"
                          style={{ backgroundColor: i < strength.score ? strength.color : "rgba(255,255,255,0.1)" }}
                        />
                      ))}
                    </div>
                    <span className="text-xs mt-1 inline-block" style={{ color: strength.color }}>{strength.label} password</span>
                  </div>
                )}

                <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 gap-2 mt-2 disabled:opacity-70">
                  {busyAction === "register" && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
                  Register →
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/40">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setOauthNotice("Google and GitHub registration are coming soon. For now, please register using your email and password.")} className="btn bg-white/5 text-white border-white/15 hover:bg-white/10 gap-2">
                  <img src={googleLogo} alt="" className="w-5 h-5" /> Google
                </button>
                <button type="button" onClick={() => setOauthNotice("Google and GitHub registration are coming soon. For now, please register using your email and password.")} className="btn bg-white/5 text-white border-white/15 hover:bg-white/10 gap-2">
                  <img src={githubLogo} alt="" className="w-5 h-5" /> GitHub
                </button>
              </div>
              {oauthNotice && <p role="status" className="mt-3 text-center text-sm text-amber-200">{oauthNotice}</p>}

              <p className="text-center text-white/50 text-sm mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-300 font-medium hover:underline">Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
