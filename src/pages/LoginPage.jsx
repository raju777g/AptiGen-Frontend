import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import regRobotImg from "../assets/reg-robot-img.png";
import googleLogo from "../assets/google.png";
import githubLogo from "../assets/github.png";
import logoMark from "../assets/logo-mark.png";
import emailIcon from "../assets/register-login-logos/email.png";
import passIcon from "../assets/register-login-logos/pass.png";
import visibleIcon from "../assets/register-login-logos/visible.png";
import hideIcon from "../assets/register-login-logos/hide1.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const submittingRef = useRef(false);
  const [error, setError] = useState("");
  const [oauthNotice, setOauthNotice] = useState("");
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const isAdminLogin = new URLSearchParams(window.location.search).get("admin") === "1";
  const emailVerified = new URLSearchParams(window.location.search).get("verified") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    // Read from the form controls so mobile browser/password-manager autofill
    // works even when it does not dispatch React's change event.
    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get("email") || email);
    const submittedPassword = String(formData.get("password") || password);
    submittingRef.current = true;
    setBusy(true);
    setError("");
    try {
      const user = await login(submittedEmail, submittedPassword);
      if (isAdminLogin && user?.role !== "ADMIN") {
        await logout();
        setError("This account does not have administrator access.");
        return;
      }
      navigate(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err?.response?.data?.blocked ? { message: err.response.data.message, blocked: true } : (err?.response?.data?.message || "Invalid email or password"));
    } finally {
      submittingRef.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--magic-gradient)" }}>
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: welcome copy + robot */}
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-purple-200 bg-purple-500/15 border border-purple-400/25 rounded-full px-4 py-1.5 mb-5">
            👋 Welcome Back
          </span>

          <h1 className="font-hero font-extrabold text-4xl leading-tight text-white mb-4">
            Continue Your{" "}
            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Learning Journey
            </span>
          </h1>
          <p className="text-white/60 mb-10 max-w-md">
            Log back in to pick up where you left off — your tests, coins, and progress are waiting.
          </p>

          <div className="flex justify-center">
            <img src={regRobotImg} alt="AptiGen AI assistant" className="w-full max-w-sm object-contain" />
          </div>
        </div>

        {/* Glass form card */}
        <div
          className="w-full max-w-md mx-auto rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
          style={{ backgroundColor: "rgba(15,10,40,0.72)", border: "1px solid rgba(168,85,247,0.35)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-5">
            <img src={logoMark} alt="AptiGen" className="h-8 w-8" />
            <span className="font-hero font-bold text-2xl text-white">AptiGen</span>
          </div>

          <h1 className="text-center font-hero font-bold text-xl text-white mb-1">
            {isAdminLogin ? "Admin login" : <>Login to <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AptiGen</span></>}
          </h1>
          <p className="text-center text-white/50 text-sm mb-6">Pick up right where you left off</p>

          {emailVerified && <div role="status" className="text-sm mb-4 rounded-lg px-3 py-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-200">Email verified. Your 50 AG coin welcome bonus is ready. You can now log in.</div>}

          {error && (
            <div className="text-sm mb-4 rounded-lg px-3 py-2 bg-red-500/15 border border-red-400/30 text-red-200">
              {typeof error === "string" ? error : <>{error.message} <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40aptigen.com" target="_blank" rel="noreferrer" className="font-semibold underline">Email us</a></>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

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
                autoComplete="username"
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
                placeholder="Password"
                required
                autoComplete="current-password"
                className="grow bg-transparent outline-none placeholder:text-white/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="text-right -mt-1">
                <Link to="/forgot-password" className="text-xs text-purple-300 hover:underline">Forgot password?</Link>
              </div>

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


            {/* Login Button */}
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 gap-2 mt-2 disabled:opacity-70"
            >
              {busy ? <><span className="loading loading-spinner loading-sm" aria-hidden="true" /> Signing in...</> : "Login →"}
            </button>

          </form>

          <p className="text-center text-white/50 text-sm mt-4">
            No account?{" "}
            <Link to="/register" className="text-purple-300 font-medium hover:underline">Register</Link>
          </p>
          {isAdminLogin ? (
            <p className="mt-3 text-center text-sm"><Link to="/login" className="text-purple-300/80 hover:text-purple-200 hover:underline">User login</Link></p>
          ) : (
            <p className="mt-3 text-center text-sm"><Link to="/login?admin=1" className="text-purple-300/80 hover:text-purple-200 hover:underline">Administrator login</Link></p>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setOauthNotice("Google and GitHub login are coming soon. For now, please log in using your email and password.")} className="btn bg-white/5 text-white border-white/15 hover:bg-white/10 gap-2">
              <img src={googleLogo} alt="" className="w-5 h-5" /> Google
            </button>
            <button type="button" onClick={() => setOauthNotice("Google and GitHub login are coming soon. For now, please log in using your email and password.")} className="btn bg-white/5 text-white border-white/15 hover:bg-white/10 gap-2">
              <img src={githubLogo} alt="" className="w-5 h-5" /> GitHub
            </button>
          </div>
          {oauthNotice && <p role="status" className="mt-3 text-center text-sm text-amber-200">{oauthNotice}</p>}
        </div>
      </div>
    </div>
  );
}
