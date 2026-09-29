import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function CheckInModal({ result, onClose }) {
  const location = useLocation();

  useEffect(() => {
    if (result) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!result) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result, onClose]);

  if (!result) return null;
  const alreadyCheckedIn = result.alreadyCheckedIn;
  const streak = result.streak ?? 0;

  return (
    <div className="checkin-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className={`checkin-card ${alreadyCheckedIn ? "is-complete" : "is-reward"}`} role="dialog" aria-modal="true" aria-labelledby="checkin-title">
        <button type="button" className="checkin-close" onClick={onClose} aria-label="Close check-in message">×</button>
        {!alreadyCheckedIn && <div className="checkin-confetti" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${[7, 16, 26, 35, 44, 54, 64, 73, 82, 91, 22, 78][i]}%`, animationDelay: `${-i * 0.21}s` }} />)}</div>}
        <div className="checkin-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="checkin-medallion" aria-hidden="true">{alreadyCheckedIn ? "✓" : "🪙"}</div>
        {alreadyCheckedIn ? (
          <>
            <span className="checkin-eyebrow">DAILY CHECK-IN</span>
            <h2 id="checkin-title">You’re all set!</h2>
            <p className="checkin-copy">You’ve already checked in today. Come back tomorrow to keep your streak growing.</p>
          </>
        ) : (
          <>
            <span className="checkin-eyebrow">DAILY REWARD UNLOCKED</span>
            <h2 id="checkin-title"><span>+{result.coinsAwarded}</span> AG Coins!</h2>
            <p className="checkin-copy">A little progress every day adds up. Keep showing up!</p>
          </>
        )}
        <div className="checkin-stats">
          <div className="checkin-stat"><span className="checkin-stat-icon">🔥</span><b>{streak} day{streak !== 1 ? "s" : ""}</b><small>current streak</small></div>
          {!alreadyCheckedIn && <div className="checkin-stat"><span className="checkin-stat-icon">🪙</span><b>{result.newBalance ?? "—"}</b><small>coin balance</small></div>}
        </div>
        <button type="button" className="checkin-continue" onClick={onClose}>{alreadyCheckedIn ? "Got it" : "Let’s keep going"}<span>→</span></button>
      </section>
      <style>{`
        .checkin-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1rem;background:rgba(4,7,22,.72);backdrop-filter:blur(9px);animation:checkin-fade .22s ease both}
        .checkin-card{position:relative;isolation:isolate;overflow:hidden;width:min(100%,430px);padding:2.25rem 2rem 1.8rem;text-align:center;border:1px solid rgba(169,116,255,.62);border-radius:28px;color:#f6f4ff;background:radial-gradient(ellipse at 50% -10%,rgba(126,70,255,.35),transparent 58%),linear-gradient(145deg,#171b3b,#0b1129 78%);box-shadow:0 28px 90px rgba(0,0,0,.48),0 0 45px rgba(132,67,255,.22);animation:checkin-enter .55s cubic-bezier(.18,.85,.25,1) both}
        .checkin-card:before{content:"";position:absolute;z-index:-1;inset:10px;border:1px solid rgba(181,154,255,.12);border-radius:20px;pointer-events:none}
        .checkin-close{position:absolute;top:.8rem;right:.9rem;z-index:4;width:34px;height:34px;border:1px solid rgba(196,183,255,.2);border-radius:50%;background:rgba(255,255,255,.06);color:#e5ddff;font-size:1.45rem;line-height:1;cursor:pointer;transition:transform .2s,background .2s}
        .checkin-close:hover{transform:rotate(90deg);background:rgba(255,255,255,.13)}
        .checkin-medallion{position:relative;z-index:2;display:grid;place-items:center;width:88px;height:88px;margin:0 auto 1rem;border:1px solid rgba(255,211,106,.55);border-radius:50%;background:radial-gradient(circle at 35% 25%,#fff1ac,#ffbd33 52%,#d8750d);font-size:2.55rem;box-shadow:0 0 0 8px rgba(255,192,54,.08),0 0 35px rgba(255,175,35,.42),inset 0 2px 7px rgba(255,255,255,.7);animation:checkin-coin 2.6s ease-in-out infinite}
        .is-complete .checkin-medallion{color:#fff;background:radial-gradient(circle at 35% 25%,#8cf5c4,#20b978 65%,#08714c);border-color:rgba(130,255,195,.55);box-shadow:0 0 0 8px rgba(52,211,153,.08),0 0 32px rgba(52,211,153,.3);animation:checkin-success 2.5s ease-in-out infinite}
        .checkin-orbit{position:absolute;top:2.2rem;left:50%;width:150px;height:92px;border:1px solid rgba(183,126,255,.18);border-radius:50%;transform:translateX(-50%) rotate(-18deg);animation:checkin-orbit 8s linear infinite;pointer-events:none}
        .checkin-orbit span{position:absolute;width:7px;height:7px;border-radius:50%;background:#c98cff;box-shadow:0 0 12px #c98cff}.checkin-orbit span:nth-child(1){top:8px;left:24px}.checkin-orbit span:nth-child(2){right:10px;top:43px;background:#71d9ff;box-shadow:0 0 12px #71d9ff}.checkin-orbit span:nth-child(3){bottom:2px;left:48px;background:#ffd36b;box-shadow:0 0 12px #ffd36b}
        .checkin-eyebrow{display:block;color:#c39bff;font-size:.68rem;font-weight:850;letter-spacing:.2em}
        .checkin-card h2{margin:.55rem 0 .5rem;font-family:'Sora',sans-serif;font-size:1.8rem;line-height:1.2;font-weight:850;color:#fff}.checkin-card h2 span{background:linear-gradient(90deg,#ffe27a,#ffad30);background-clip:text;-webkit-background-clip:text;color:transparent;text-shadow:none}
        .checkin-copy{max-width:315px;margin:0 auto;color:#b5bedf;font-size:.9rem;line-height:1.55}
        .checkin-stats{display:flex;justify-content:center;gap:.75rem;margin:1.35rem auto 1.25rem}.checkin-stat{display:flex;min-width:125px;flex-direction:column;align-items:center;padding:.8rem 1rem;border:1px solid rgba(139,151,205,.2);border-radius:15px;background:rgba(255,255,255,.045)}.checkin-stat-icon{font-size:1.1rem;margin-bottom:.15rem}.checkin-stat b{font-size:.95rem;color:#f3f3ff}.checkin-stat small{margin-top:.1rem;color:#939fca;font-size:.68rem}
        .checkin-continue{display:flex;align-items:center;justify-content:center;gap:.65rem;width:100%;min-height:46px;border:1px solid rgba(194,136,255,.45);border-radius:12px;background:linear-gradient(100deg,#6245f5,#a839e6);color:#fff;font-weight:800;box-shadow:0 8px 22px rgba(112,65,236,.28);cursor:pointer;transition:transform .2s,box-shadow .2s}.checkin-continue:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(112,65,236,.4)}
        .checkin-confetti{position:absolute;inset:0;overflow:hidden;pointer-events:none}.checkin-confetti i{position:absolute;top:-12px;left:calc(var(--piece)*1%);width:6px;height:10px;border-radius:2px;background:var(--piece-color);opacity:0;animation:checkin-confetti-fall 2.6s ease-in infinite;animation-delay:calc(var(--piece)*-.08s)}.checkin-confetti i:nth-child(1){--piece:7;--piece-color:#45d8ff}.checkin-confetti i:nth-child(2){--piece:16;--piece-color:#ffcf54}.checkin-confetti i:nth-child(3){--piece:26;--piece-color:#b779ff}.checkin-confetti i:nth-child(4){--piece:35;--piece-color:#ff70bc}.checkin-confetti i:nth-child(5){--piece:44;--piece-color:#4df0ad}.checkin-confetti i:nth-child(6){--piece:54;--piece-color:#ffcf54}.checkin-confetti i:nth-child(7){--piece:64;--piece-color:#45d8ff}.checkin-confetti i:nth-child(8){--piece:73;--piece-color:#b779ff}.checkin-confetti i:nth-child(9){--piece:82;--piece-color:#ff70bc}.checkin-confetti i:nth-child(10){--piece:91;--piece-color:#4df0ad}.checkin-confetti i:nth-child(11){--piece:22;--piece-color:#ffcf54;animation-delay:-1.1s}.checkin-confetti i:nth-child(12){--piece:78;--piece-color:#45d8ff;animation-delay:-1.7s}
        @keyframes checkin-fade{from{opacity:0}to{opacity:1}}@keyframes checkin-enter{from{opacity:0;transform:translateY(24px) scale(.92)}65%{transform:translateY(-3px) scale(1.015)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes checkin-coin{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-7px) rotate(5deg)}}@keyframes checkin-success{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes checkin-orbit{to{transform:translateX(-50%) rotate(342deg)}}@keyframes checkin-confetti-fall{0%{transform:translateY(-8px) rotate(0);opacity:0}15%{opacity:.9}100%{transform:translateY(370px) rotate(520deg);opacity:0}}
        [data-theme="aptigen"] .checkin-card{color:#202b4c;background:radial-gradient(ellipse at 50% -10%,rgba(126,70,255,.17),transparent 58%),linear-gradient(145deg,#fff,#f4f3ff 78%);box-shadow:0 28px 80px rgba(35,42,83,.25),0 0 38px rgba(132,67,255,.15)}
        [data-theme="aptigen"] .checkin-card h2{color:#202b4c}[data-theme="aptigen"] .checkin-copy{color:#596784}[data-theme="aptigen"] .checkin-stat{background:rgba(255,255,255,.7);border-color:#e0e2f0}[data-theme="aptigen"] .checkin-stat b{color:#263452}[data-theme="aptigen"] .checkin-stat small{color:#75819a}[data-theme="aptigen"] .checkin-close{color:#584078;background:#f3effa;border-color:#e3d8f2}
        @media(max-width:480px){.checkin-card{padding:2rem 1.35rem 1.35rem;border-radius:23px}.checkin-medallion{width:76px;height:76px;font-size:2.2rem}.checkin-card h2{font-size:1.55rem}.checkin-stats{gap:.5rem}.checkin-stat{min-width:112px;padding:.7rem .55rem}}
        @media(prefers-reduced-motion:reduce){.checkin-overlay,.checkin-card,.checkin-medallion,.checkin-orbit,.checkin-confetti i{animation:none!important}.checkin-close,.checkin-continue{transition:none}}
      `}</style>
    </div>
  );
}
