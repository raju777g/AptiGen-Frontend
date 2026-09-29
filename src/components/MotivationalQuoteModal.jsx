import { useEffect } from "react";

// Replace these starter quotes with the full set of 31 supplied by the user.
export const MOTIVATIONAL_QUOTES = [
  "Success begins with the decision to try, and grows with every hour you study.",
  "Study today, shine tomorrow.",
  "Your future is created by what you do today, not tomorrow.",
  "Every page you read brings you one step closer to your dreams.",
  "Small progress every day leads to extraordinary results.",
  "Don't study to pass the exam; study to build the person you want to become.",
  "The pain of discipline is temporary, but the pride of achievement lasts forever.",
  "Dream big, study hard, and let your success speak for itself.",
  "One hour of focused study is worth more than five hours of distraction.",
  "Your competition is not others; it is the person you were yesterday.",
  "Difficult roads often lead to the most beautiful destinations.",
  "Every mistake you make while learning is a step toward mastery.",
  "A little progress each day adds up to big results.",
  "Your dreams deserve more than your excuses.",
  "The more you learn, the more possibilities you create.",
  "Don't count the hours you study; make the hours you study count.",
  "Discipline will take you places where motivation cannot.",
  "Great achievements are built from countless small efforts.",
  "When you feel like quitting, remember why you started.",
  "Education is an investment in the person you are becoming.",
  "You don't have to be perfect; you just have to keep improving.",
  "The secret to getting ahead is getting started.",
  "Every chapter you complete is a victory over procrastination.",
  "Your future self will thank you for the effort you make today.",
  "Believe in your ability to learn, even when the subject feels impossible.",
  "Success is the sum of consistent efforts repeated day after day.",
  "Replace 'I can't' with 'I'll learn how.'",
  "The best way to predict your future is to prepare for it.",
  "Challenges in your studies are opportunities to discover your strength.",
  "Stay focused, stay humble, and let your progress make the noise.",
  "One day, the hours you spend studying will become the opportunities you once dreamed of."
];

export default function MotivationalQuoteModal({ open, quoteIndex, onClose, onNext }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="quote-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="quote-card" role="dialog" aria-modal="true" aria-labelledby="quote-title">
        <button className="quote-close" onClick={onClose} aria-label="Close quote">×</button>
        <div className="quote-sparkle" aria-hidden="true">✦</div>
        <span className="quote-eyebrow" id="quote-title">A LITTLE MOTIVATION</span>
        <blockquote key={quoteIndex} className="quote-text">“{quote}”</blockquote>
        <div className="quote-author">— AptiGen</div>
        <button className="quote-next" onClick={onNext}>Another quote <span>→</span></button>
      </section>
      <style>{`
        .quote-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:1.25rem;background:rgba(5,8,25,.68);backdrop-filter:blur(9px);animation:quote-fade-in .22s ease both}
        .quote-card{position:relative;isolation:isolate;overflow:hidden;width:min(100%,480px);padding:2.5rem 2.2rem 1.8rem;text-align:center;border:1px solid rgba(167,112,255,.65);border-radius:26px;color:#f7f4ff;background:radial-gradient(ellipse at 50% -20%,rgba(112,60,255,.36),transparent 62%),linear-gradient(145deg,#151936,#0c122b);box-shadow:0 25px 90px rgba(0,0,0,.45),0 0 42px rgba(133,68,255,.25);animation:quote-card-enter .55s cubic-bezier(.18,.85,.25,1) both}
        .quote-card:before{content:"";position:absolute;inset:10px;border:1px solid rgba(164,132,255,.11);border-radius:19px;pointer-events:none;z-index:-1}
        .quote-close{position:absolute;top:.8rem;right:1rem;width:36px;height:36px;border:1px solid rgba(192,181,255,.2);border-radius:50%;background:rgba(255,255,255,.05);color:#e3ddff;font-size:1.5rem;line-height:1;cursor:pointer}
        .quote-sparkle{font-size:2rem;color:#d79cff;text-shadow:0 0 22px #a65cff;animation:quote-sparkle 2s ease-in-out infinite}
        .quote-eyebrow{display:block;margin-top:.45rem;color:#bd93ff;font-size:.7rem;font-weight:800;letter-spacing:.2em}
        .quote-text{margin:1.25rem 0 .75rem;font-family:'Sora',sans-serif;font-size:clamp(1.45rem,5vw,2.2rem);font-weight:750;line-height:1.3;letter-spacing:-.035em;background:linear-gradient(100deg,#fff,#d5b2ff 55%,#ffb5e5);background-clip:text;-webkit-background-clip:text;color:transparent;animation:quote-text-enter .45s cubic-bezier(.2,.8,.2,1) both}
        .quote-author{color:#aab4dc;font-size:.86rem}
        .quote-next{display:inline-flex;align-items:center;gap:.6rem;margin-top:1.8rem;padding:.7rem 1.1rem;border:1px solid rgba(164,112,255,.56);border-radius:999px;background:linear-gradient(100deg,rgba(110,61,239,.9),rgba(177,45,224,.9));color:#fff;font-weight:700;box-shadow:0 5px 22px rgba(119,54,231,.3);cursor:pointer;transition:transform .2s,box-shadow .2s}
        .quote-next:hover{transform:translateY(-2px);box-shadow:0 9px 27px rgba(119,54,231,.42)}
        @keyframes quote-fade-in{from{opacity:0}to{opacity:1}}
        @keyframes quote-card-enter{from{opacity:0;transform:translateY(22px) scale(.92)}65%{transform:translateY(-3px) scale(1.015)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes quote-text-enter{from{opacity:0;transform:translateY(12px);filter:blur(5px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
        @keyframes quote-sparkle{0%,100%{transform:scale(.92) rotate(-8deg);opacity:.75}50%{transform:scale(1.12) rotate(8deg);opacity:1}}
        [data-theme="aptigen"] .quote-card{color:#222949;background:radial-gradient(ellipse at 50% -20%,rgba(112,60,255,.15),transparent 62%),linear-gradient(145deg,#fff,#f5f1ff);box-shadow:0 25px 80px rgba(34,36,80,.22),0 0 35px rgba(133,68,255,.17)}
        [data-theme="aptigen"] .quote-author{color:#687391}
        [data-theme="aptigen"] .quote-close{color:#50347b;background:#f4efff;border-color:#ded1f5}
        @media(prefers-reduced-motion:reduce){.quote-overlay,.quote-card,.quote-text,.quote-sparkle{animation:none!important}.quote-next{transition:none}}
      `}</style>
    </div>
  );
}
