import { useEffect, useState } from "react";
import { api } from "../api/client";
import referModels from "../assets/refer-models.png";
import whatsapp from "../assets/social-icons/whatsapp.png";
import telegram from "../assets/social-icons/telegram.png";
import x from "../assets/social-icons/x.png";
import facebook from "../assets/social-icons/facebook.png";
import linkedin from "../assets/social-icons/linkedin.png";

const BENEFITS = [
  ["👥", "Grow Together", "Learn with friends", "#a855f7"],
  ["💎", "Earn Rewards", "Get 20 AG coins each", "#168eff"],
  ["👑", "Unlock More", "Access premium features", "#f59e0b"],
];

function StatCard({ icon, value, label, tone }) {
  return <article className={`ref-stat ${tone}`}><span className="ref-stat-icon">{icon}</span><span className="ref-stat-copy"><b>{value}</b><small>{label}</small></span></article>;
}

export default function ReferralPage() {
  const [code, setCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/auth/referral-link").then(({ data }) => setCode(data.referralCode));
    api.get("/auth/referral-stats").then(({ data }) => setStats(data));
  }, []);

  const referralLink = code ? `${window.location.origin}/register?ref=${code}` : "";
  const shareText = "Turn any question paper into a mock test in seconds with AptiGen! Sign up with my link and we both get 20 AG coins:";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareLinks = [
    { icon: whatsapp, label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}` },
    { icon: telegram, label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}` },
    { icon: x, label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}` },
    { icon: facebook, label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
    { icon: linkedin, label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
  ];
  const steps = [
    { num: 1, icon: "👥", title: "Invite Friends", desc: "Share your unique link with friends", color: "violet" },
    { num: 2, icon: "📧", title: "They Sign Up", desc: "Your friend creates an account and verifies their email", color: "blue" },
    { num: 3, icon: "🪙", title: "You Both Earn", desc: "Get 20 AG coins automatically", color: "pink" },
  ];

  return (
    <main className="referral-page">
      <div className="referral-inner">
        <section className="referral-hero">
          <div className="ref-hero-copy">
            <span className="ref-kicker">🎁 <span>REFERRAL PROGRAM</span></span>
            <h1>Invite Friends,<br /><em>Earn Coins</em></h1>
            <p>Share AptiGen with your friends. You both get <b>20 AG coins</b> when they sign up and verify their email.</p>
            <div className="ref-benefits">{BENEFITS.map(([icon, title, desc, tone]) => <div className="ref-benefit" key={title}><span style={{ "--benefit-tone": tone }}>{icon}</span><div><b>{title}</b><small>{desc}</small></div></div>)}</div>
          </div>
          <div className="ref-hero-art"><div className="ref-art-glow" /><img src={referModels} alt="Two friends celebrating their AG coin referral rewards" /></div>
        </section>

        <section className="ref-stats" aria-label="Referral summary">
          <StatCard icon="👥" value={stats?.friendsInvited ?? "…"} label="Friends Invited" tone="violet" />
          <StatCard icon="🪙" value={stats?.coinsEarned ?? "…"} label="Coins Earned" tone="gold" />
          <StatCard icon="✉️" value={stats?.successfulSignups ?? "…"} label="Successful Signups" tone="green" />
          <StatCard icon="🎁" value={stats?.pendingReferrals ?? "…"} label="Pending Referrals" tone="pink" />
        </section>

        <section className="ref-content-grid">
          <article className="ref-panel ref-link-panel">
            <header className="ref-panel-heading"><span className="ref-heading-icon">🔗</span><h2>Your Referral Link</h2></header>
            <p className="ref-panel-subtitle">Share this link with your friends and earn coins together!</p>
            {code ? <>
              <div className="ref-link-control"><input readOnly value={referralLink} aria-label="Your referral link" /><button onClick={handleCopy}>{copied ? "✓ Copied!" : <>▢ &nbsp; Copy</>}</button></div>
              <p className="ref-share-label">Share via</p>
              <div className="ref-share-list">{shareLinks.map((share) => <a key={share.label} href={share.url} target="_blank" rel="noopener noreferrer" className={`ref-share-button ${share.label.toLowerCase()}`} title={`Share via ${share.label}`} aria-label={`Share via ${share.label}`}><img src={share.icon} alt="" /></a>)}</div>
            </> : <div className="ref-link-loading"><span className="loading loading-spinner loading-sm" /> Preparing your referral link…</div>}
          </article>

          <article className="ref-panel ref-steps-panel">
            <header className="ref-panel-heading"><span className="ref-heading-icon">⚙️</span><h2>How It Works?</h2></header>
            <p className="ref-panel-subtitle">It’s simple, and you both earn 20 AG coins!</p>
            <div className="ref-steps">{steps.map((step, index) => <div className="ref-step-wrap" key={step.num}><article className={`ref-step ${step.color}`}><span className="ref-step-num">{step.num}</span><span className="ref-step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.desc}</p></article>{index < steps.length - 1 && <span className="ref-step-arrow">→</span>}</div>)}</div>
          </article>
        </section>
      </div>
      <style>{`
        .referral-page{position:relative;isolation:isolate;overflow:hidden;margin:-1rem;padding:1.25rem 1.5rem 2rem;min-height:100%;color:#f5f5ff;background:radial-gradient(ellipse at 45% 0%,rgba(66,25,183,.22),transparent 48%),linear-gradient(135deg,#080d24,#0b102b 60%,#090d23)}
        .referral-page:before{content:"";position:absolute;inset:0;z-index:-1;opacity:.3;background-image:linear-gradient(rgba(110,89,204,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(110,89,204,.09) 1px,transparent 1px);background-size:76px 76px;mask-image:linear-gradient(#000,transparent 84%)}
        .referral-inner{max-width:1500px;margin:0 auto}.referral-hero{position:relative;display:grid;grid-template-columns:minmax(400px,.95fr) minmax(0,1.05fr);align-items:center;min-height:365px;margin:0 -1.5rem 1rem;padding:1.2rem 3rem .5rem;overflow:hidden;background:radial-gradient(ellipse at 70% 56%,rgba(104,31,222,.23),transparent 48%),linear-gradient(112deg,rgba(9,14,40,.25),rgba(18,10,57,.2))}.referral-hero:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,transparent 18%,rgba(78,32,203,.2) 18.2%,transparent 46%),linear-gradient(145deg,transparent 36%,rgba(57,37,174,.12) 36.2%,transparent 73%)}.ref-hero-copy{position:relative;z-index:2}.ref-kicker{display:inline-flex;align-items:center;gap:.5rem;padding:.45rem .8rem;border:1px solid #57339d;border-radius:999px;background:rgba(65,30,122,.22);color:#e4caff;font-size:.82rem}.ref-kicker span{font-weight:700;letter-spacing:.06em}.ref-hero-copy h1{margin:1rem 0 .55rem;font-family:'Sora',sans-serif;font-size:clamp(3rem,5vw,4.5rem);font-weight:900;line-height:.98;letter-spacing:-.055em;color:#fff}.ref-hero-copy h1 em{font-style:normal;background:linear-gradient(90deg,#983bff,#ef35d5 68%,#f05fce);background-clip:text;-webkit-background-clip:text;color:transparent}.ref-hero-copy>p{max-width:610px;margin:0;color:#bdc6e4;font-size:1rem;line-height:1.55}.ref-hero-copy>p b{color:#ffcc36}.ref-benefits{display:flex;flex-wrap:wrap;gap:1.2rem;margin-top:1.55rem}.ref-benefit{display:flex;align-items:center;gap:.65rem}.ref-benefit>span{display:grid;place-items:center;width:48px;height:48px;border:1px solid color-mix(in srgb,var(--benefit-tone),transparent 38%);border-radius:14px;background:color-mix(in srgb,var(--benefit-tone),transparent 82%);font-size:1.35rem}.ref-benefit b,.ref-benefit small{display:block}.ref-benefit b{font-size:.82rem;color:#f5f4ff}.ref-benefit small{margin-top:.16rem;color:#aeb8db;font-size:.72rem}.ref-hero-art{position:relative;display:flex;align-items:center;justify-content:center;align-self:stretch;min-width:0}.ref-hero-art img{position:relative;z-index:1;width:min(100%,690px);max-height:390px;object-fit:contain;filter:drop-shadow(0 12px 35px rgba(123,46,255,.3));animation:ref-art-float 5s ease-in-out infinite}.ref-art-glow{position:absolute;inset:20% 10%;border-radius:50%;background:#7a28ec;opacity:.22;filter:blur(70px)}
        .ref-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin:0 0 1.15rem;padding:.85rem;border:1px solid #53309c;border-radius:18px;background:rgba(10,14,38,.55);box-shadow:0 0 24px rgba(111,47,222,.08)}.ref-stat{display:flex;align-items:center;gap:.8rem;min-height:94px;padding:.8rem;border:1px solid;border-radius:15px;background:rgba(18,24,49,.8)}.ref-stat-icon{display:grid;place-items:center;flex:none;width:64px;height:64px;border-radius:16px;font-size:1.8rem}.ref-stat-copy b,.ref-stat-copy small{display:block}.ref-stat-copy b{font-family:'Sora',sans-serif;font-size:1.55rem;line-height:1.15}.ref-stat-copy small{margin-top:.25rem;color:#b5bfdc;font-size:.86rem}.ref-stat.violet{border-color:#47228a;background:linear-gradient(120deg,rgba(93,32,174,.16),rgba(18,24,49,.8))}.ref-stat.violet .ref-stat-icon{background:rgba(115,47,222,.35)}.ref-stat.gold{border-color:#69501f;background:linear-gradient(120deg,rgba(196,132,24,.12),rgba(18,24,49,.8))}.ref-stat.gold .ref-stat-icon{background:rgba(200,137,25,.25)}.ref-stat.green{border-color:#135d4d;background:linear-gradient(120deg,rgba(25,155,110,.12),rgba(18,24,49,.8))}.ref-stat.green .ref-stat-icon{background:rgba(16,160,111,.25)}.ref-stat.pink{border-color:#70234f;background:linear-gradient(120deg,rgba(188,42,121,.12),rgba(18,24,49,.8))}.ref-stat.pink .ref-stat-icon{background:rgba(191,42,123,.25)}
        .ref-content-grid{display:grid;grid-template-columns:1.03fr 1fr;gap:1.15rem}.ref-panel{min-width:0;padding:1.35rem 1.5rem;border:1px solid #40366f;border-radius:19px;background:linear-gradient(140deg,rgba(17,23,49,.96),rgba(12,18,41,.96));box-shadow:0 14px 38px rgba(2,5,20,.2)}.ref-link-panel{border-color:#7741c7;box-shadow:0 12px 38px rgba(93,37,190,.12)}.ref-panel-heading{display:flex;align-items:center;gap:.65rem}.ref-heading-icon{font-size:1.6rem;filter:drop-shadow(0 0 8px rgba(122,68,255,.5))}.ref-panel-heading h2{margin:0;font-family:'Sora',sans-serif;font-size:1.3rem;font-weight:800;color:#f8f7ff}.ref-panel-subtitle{margin:.45rem 0 1rem;color:#b7c1df;font-size:.9rem}.ref-link-control{display:flex;min-height:49px;overflow:hidden;border:1px solid #5644b7;border-radius:10px;background:#0c1430}.ref-link-control input{min-width:0;flex:1;padding:.7rem .85rem;border:0;outline:0;background:transparent;color:#fff;font-size:.88rem}.ref-link-control button{padding:0 1.15rem;border:0;background:linear-gradient(100deg,#5148fa,#bd35ec);color:#fff;font-weight:800;white-space:nowrap;cursor:pointer}.ref-link-control button:hover{filter:brightness(1.12)}.ref-share-label{margin:.9rem 0 .55rem;color:#c0c9e5;font-size:.8rem}.ref-share-list{display:flex;gap:.55rem}.ref-share-button{display:grid;place-items:center;width:45px;height:45px;border-radius:11px;background:#1c2747;transition:transform .2s,box-shadow .2s}.ref-share-button:hover{transform:translateY(-3px);box-shadow:0 8px 16px #0004}.ref-share-button img{width:29px;height:29px;object-fit:contain}.ref-share-button.whatsapp{background:#087e56}.ref-share-button.telegram{background:#0787c5}.ref-share-button.x{background:#20293f}.ref-share-button.facebook{background:#1d57ad}.ref-share-button.linkedin{background:#0878a7}.ref-link-loading{display:flex;align-items:center;gap:.65rem;padding:1rem 0;color:#aeb8db;font-size:.85rem}
        .ref-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin-top:.9rem}.ref-step-wrap{position:relative;min-width:0}.ref-step{height:100%;min-height:158px;padding:.85rem;border:1px solid;border-radius:15px;background:rgba(22,26,56,.65)}.ref-step.violet{border-color:#532b98}.ref-step.blue{border-color:#14549b;background:rgba(13,47,91,.3)}.ref-step.pink{border-color:#762454;background:rgba(82,20,62,.26)}.ref-step-num{display:grid;place-items:center;width:34px;height:34px;margin-bottom:.55rem;border-radius:50%;background:linear-gradient(140deg,#ba4cff,#7b35ed);color:#fff;font-weight:800}.ref-step.blue .ref-step-num{background:linear-gradient(140deg,#299aff,#1766e8)}.ref-step.pink .ref-step-num{background:linear-gradient(140deg,#ff52ba,#e4238b)}.ref-step-icon{position:absolute;right:.8rem;top:.85rem;font-size:1.45rem}.ref-step h3{margin:0 0 .25rem;color:#f8f7ff;font-size:.91rem;font-weight:800}.ref-step p{margin:0;color:#b6c0df;font-size:.79rem;line-height:1.45}.ref-step-arrow{position:absolute;z-index:2;right:-.72rem;top:47%;color:#d2d8ef;font-size:1.1rem}
        @keyframes ref-art-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        [data-theme="aptigen"] .referral-page{color:#243253;background:radial-gradient(ellipse at 45% 0%,rgba(132,97,230,.12),transparent 48%),linear-gradient(135deg,#f2f4ff,#f8f5ff 60%,#eef3ff)}[data-theme="aptigen"] .referral-page:before{opacity:.28;background-image:linear-gradient(rgba(98,79,175,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(98,79,175,.09) 1px,transparent 1px)}[data-theme="aptigen"] .referral-hero{background:radial-gradient(ellipse at 70% 56%,rgba(128,67,216,.12),transparent 48%),linear-gradient(112deg,rgba(255,255,255,.2),rgba(240,237,255,.25))}[data-theme="aptigen"] .ref-hero-copy h1{color:#1c2544}[data-theme="aptigen"] .ref-hero-copy>p{color:#536482}[data-theme="aptigen"] .ref-benefit b{color:#263654}[data-theme="aptigen"] .ref-benefit small{color:#687896}[data-theme="aptigen"] .ref-kicker{color:#6438a7;background:#f0e8ff;border-color:#dfcff8}[data-theme="aptigen"] .ref-stats{background:rgba(255,255,255,.55);border-color:#d8c8f2}[data-theme="aptigen"] .ref-stat{background:rgba(255,255,255,.72)}[data-theme="aptigen"] .ref-stat-copy small{color:#65738f}[data-theme="aptigen"] .ref-panel{background:linear-gradient(140deg,rgba(255,255,255,.96),rgba(247,248,255,.96));border-color:#d5d7eb;box-shadow:0 14px 38px rgba(52,62,111,.08)}[data-theme="aptigen"] .ref-link-panel{border-color:#c7a4ef}[data-theme="aptigen"] .ref-panel-heading h2{color:#202b4a}[data-theme="aptigen"] .ref-panel-subtitle,[data-theme="aptigen"] .ref-share-label{color:#5e6c88}[data-theme="aptigen"] .ref-link-control{background:#f5f5fc;border-color:#cfc6ee}[data-theme="aptigen"] .ref-link-control input{color:#273451}[data-theme="aptigen"] .ref-step{background:rgba(246,246,255,.82)}[data-theme="aptigen"] .ref-step h3{color:#263451}[data-theme="aptigen"] .ref-step p{color:#5f6f8d}[data-theme="aptigen"] .ref-step-arrow{color:#6f7893}
        @media(max-width:1050px){.referral-hero{grid-template-columns:1fr .9fr;padding-inline:2rem}.ref-hero-copy h1{font-size:3.5rem}.ref-benefits{gap:.8rem}.ref-benefit>span{width:41px;height:41px}.ref-content-grid{grid-template-columns:1fr}.ref-steps-panel{order:2}}
        @media(max-width:720px){.referral-page{margin:-1rem;padding:1rem}.referral-hero{grid-template-columns:1fr;min-height:0;margin:0 -1rem 1rem;padding:1.2rem 1.15rem .4rem;gap:.3rem}.ref-hero-copy h1{font-size:clamp(2.7rem,13vw,4rem)}.ref-hero-copy>p{font-size:.9rem}.ref-benefits{gap:.8rem 1rem;margin-top:1.1rem}.ref-benefit>span{width:38px;height:38px;font-size:1.1rem}.ref-benefit b{font-size:.74rem}.ref-benefit small{font-size:.66rem}.ref-hero-art{max-height:245px;margin-top:-.3rem}.ref-hero-art img{max-height:250px;width:100%}.ref-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;padding:.55rem}.ref-stat{min-height:75px;padding:.55rem;gap:.55rem}.ref-stat-icon{width:46px;height:46px;border-radius:12px;font-size:1.35rem}.ref-stat-copy b{font-size:1.2rem}.ref-stat-copy small{font-size:.69rem}.ref-panel{padding:1rem}.ref-steps{gap:.45rem}.ref-step{min-height:175px;padding:.65rem}.ref-step h3{font-size:.78rem}.ref-step p{font-size:.69rem}.ref-step-icon{right:.55rem;top:.65rem;font-size:1.15rem}.ref-step-arrow{right:-.5rem;font-size:.85rem}}
        @media(max-width:420px){.ref-benefits{display:grid;grid-template-columns:1fr 1fr}.ref-steps{grid-template-columns:1fr}.ref-step-wrap{display:flex;align-items:center}.ref-step{min-height:0;flex:1}.ref-step-arrow{position:static;display:block;margin:0 .35rem;transform:rotate(90deg)}.ref-step-wrap:last-child .ref-step-arrow{display:none}.ref-link-control{flex-direction:column}.ref-link-control input{width:100%;min-height:42px}.ref-link-control button{min-height:42px}.ref-share-list{gap:.4rem}.ref-share-button{width:40px;height:40px}}
        @media(prefers-reduced-motion:reduce){.ref-hero-art img{animation:none}}
      `}</style>
    </main>
  );
}
