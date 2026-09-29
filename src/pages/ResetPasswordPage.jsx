   import { useState } from "react";
   import { useNavigate, Link } from "react-router-dom";
   import { api } from "../api/client";
   import { useAuthStore } from "../store/authStore";

   export default function ResetPasswordPage() {
     const user = useAuthStore((s) => s.user);
     const isChangeFlow = !!user; // logged in → "change password"; not logged in → "forgot password"
     const navigate = useNavigate();

     const [step, setStep] = useState(1); // 1 = enter email/request OTP, 2 = enter OTP + new password
     const [email, setEmail] = useState(user?.email || "");
     const [otp, setOtp] = useState("");
     const [newPassword, setNewPassword] = useState("");
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const [message, setMessage] = useState("");

     const handleRequestOtp = async (e) => {
       e.preventDefault();
       setError(""); setLoading(true);
       try {
         const { data } = await api.post("/auth/password-reset/request", { email });
         setMessage(data.message);
         setStep(2);
       } catch {
         setError("Something went wrong. Please try again.");
       } finally {
         setLoading(false);
       }
     };

     const handleVerify = async (e) => {
       e.preventDefault();
       setError(""); setLoading(true);
       try {
         await api.post("/auth/password-reset/verify", { email, otp, newPassword });
         setMessage("Password updated! Redirecting to login...");
         setTimeout(() => navigate(isChangeFlow ? "/dashboard" : "/login"), 1500);
       } catch (err) {
         setError(err.response?.data?.message || "Invalid or expired code");
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--magic-gradient)" }}>
         <div className="w-full max-w-md rounded-3xl p-8 backdrop-blur-xl shadow-2xl" style={{ backgroundColor: "rgba(15,10,40,0.72)", border: "1px solid rgba(168,85,247,0.35)" }}>
           <h1 className="text-center font-hero font-bold text-xl text-white mb-1">
             {isChangeFlow ? "Change Password" : "Reset Your Password"}
           </h1>
           <p className="text-center text-white/50 text-sm mb-6">
             {step === 1 ? "We'll email you a 6-digit code" : "Enter the code and your new password"}
           </p>

           {error && <div className="text-sm mb-4 rounded-lg px-3 py-2 bg-red-500/15 border border-red-400/30 text-red-200">{error}</div>}
           {message && <div className="text-sm mb-4 rounded-lg px-3 py-2 bg-green-500/15 border border-green-400/30 text-green-200">{message}</div>}

           {step === 1 ? (
             <form onSubmit={handleRequestOtp} className="flex flex-col gap-3">
               <label className="input bg-white/5 border-white/15 text-white flex items-center gap-2">
                 ✉️
                 <input
                   type="email" placeholder="you@example.com" required
                   className="grow bg-transparent outline-none placeholder:text-white/30"
                   value={email} onChange={(e) => setEmail(e.target.value)}
                   disabled={isChangeFlow} // logged-in users reset their own account's email only
                 />
               </label>
               <button type="submit" disabled={loading} className="btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 mt-2">
                 {loading ? "Sending..." : "Send Reset Code →"}
               </button>
             </form>
           ) : (
             <form onSubmit={handleVerify} className="flex flex-col gap-3">
               <label className="input bg-white/5 border-white/15 text-white flex items-center gap-2">
                 🔢
                 <input
                   type="text" inputMode="numeric" maxLength={6} placeholder="6-digit code" required
                   className="grow bg-transparent outline-none placeholder:text-white/30 tracking-widest"
                   value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                 />
               </label>
               <label className="input bg-white/5 border-white/15 text-white flex items-center gap-2">
                 🔒
                 <input
                   type="password" placeholder="New password (min 6 characters)" required
                   className="grow bg-transparent outline-none placeholder:text-white/30"
                   value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                 />
               </label>
               <button type="submit" disabled={loading} className="btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 mt-2">
                 {loading ? "Verifying..." : "Reset Password →"}
               </button>
               <button type="button" onClick={handleRequestOtp} className="text-xs text-purple-300 hover:underline mt-1">
                 Didn't get a code? Resend
               </button>
             </form>
           )}

           {!isChangeFlow && (
             <p className="text-center text-white/50 text-sm mt-5">
               Remembered your password? <Link to="/login" className="text-purple-300 font-medium hover:underline">Login</Link>
             </p>
           )}
         </div>
       </div>
     );
   }