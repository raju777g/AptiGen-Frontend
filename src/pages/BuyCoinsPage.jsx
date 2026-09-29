import { useRef, useState } from "react";
import { useWalletStore } from "../store/walletStore";
import agCoin from "../assets/buy-coins/agCoin.png";
import bigCoinIcon from "../assets/buy-coins/bigCoin-icon.png";
import coin10 from "../assets/buy-coins/coin-10rs.png";
import coin50 from "../assets/buy-coins/coin-50rs.png";
import coin100 from "../assets/buy-coins/coin-100rs.png";
import coin500 from "../assets/buy-coins/coin-500rs.png";

const TIERS = [
  { amount: 10, coins: 100, img: coin10, badge: "Best Value", color: "#ec36be", copy: "Perfect for getting started" },
  { amount: 50, coins: 500, img: coin50, badge: "Popular", color: "#fb4c50", copy: "Great for regular practice" },
  { amount: 100, coins: 1000, img: coin100, copy: "More tests, better progress" },
  { amount: 500, coins: 5000, img: coin500, badge: "Max Savings", color: "#3188ff", copy: "For serious learners" },
];

const BENEFITS = [
  ["⚡", "Generate More Tests", "Turn any question paper into custom mock tests", "#8b35ff"],
  ["👑", "Unlock Premium Features", "Access advanced tools and practice sets", "#2549d9"],
  ["📈", "Learn Without Limits", "Get the most out of AptiGen", "#3197ff"],
  ["📊", "Better Practice, Better Results", "More tests, more progress", "#d63bc4"],
];

function Benefit({ item }) {
  return <div className="buy-benefit"><span className="buy-benefit-icon" style={{ "--benefit-color": item[3] }}>{item[0]}</span><span><b>{item[1]}</b><small>{item[2]}</small></span></div>;
}

export default function BuyCoinsPage() {
  const { createOrder, fetchWallet, balance } = useWalletStore();
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const purchaseInProgress = useRef(false);
  const paymentAttemptId = useRef(0);
  const coinsPreview = Math.max(0, Math.floor(Number(amount) || 0) * 10);

  const pollWalletForUpdate = () => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      await fetchWallet();
      if (attempts >= 5) clearInterval(interval);
    }, 2000);
  };

  const handleBuy = async (purchaseAmount = amount) => {
    if (purchaseInProgress.current) return;
    if (!Number.isInteger(Number(purchaseAmount)) || purchaseAmount < 1 || purchaseAmount > 5000) {
      setStatus("failed");
      setPaymentError("Enter an amount between ₹1 and ₹5,000.");
      return;
    }
    purchaseInProgress.current = true;
    const attemptId = ++paymentAttemptId.current;
    setPaymentError("");
    setStatus("processing");
    try {
      const order = await createOrder(purchaseAmount);
      if (attemptId !== paymentAttemptId.current) {
        purchaseInProgress.current = false;
        return;
      }
      if (typeof window.Razorpay !== "function") {
        throw new Error("Payment checkout could not load. Check your connection and try again.");
      }
      if (!order?.keyId || !order?.orderId || !order?.amount) {
        throw new Error("The server returned an incomplete payment order. Please try again.");
      }
      const razorpay = new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: "AptiGen", description: `${order.coinsToCredit} AG Coins`, theme: { color: "#7c3aed" },
        handler: () => { if (attemptId !== paymentAttemptId.current) return; purchaseInProgress.current = false; setStatus("success"); pollWalletForUpdate(); },
        modal: { ondismiss: () => { if (attemptId !== paymentAttemptId.current) return; purchaseInProgress.current = false; setStatus(null); } },
      });
      razorpay.on("payment.failed", (response) => {
        if (attemptId !== paymentAttemptId.current) return;
        purchaseInProgress.current = false;
        setStatus("failed");
        setPaymentError(response?.error?.description || response?.error?.reason || "Your payment was declined. Try another payment method.");
      });
      razorpay.open();
    } catch (error) {
      purchaseInProgress.current = false;
      if (attemptId !== paymentAttemptId.current) return;
      setStatus("failed");
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      setPaymentError(serverMessage || error?.message || "Could not start checkout. Please try again.");
    }
  };

  return (
    <div className="buy-coins-page">
      <div className="buy-coins-inner">
        <section className="buy-hero">
          <div className="buy-hero-copy">
            <span className="buy-kicker"><img src={agCoin} alt="" /> AG COINS</span>
            <h1>Fuel Your<br /><em>Learning Journey</em></h1>
            <p className="buy-intro">Get AG Coins to unlock premium features, generate more tests, access advanced tools and accelerate your preparation.</p>
            <div className="buy-benefits">{BENEFITS.map((item) => <Benefit key={item[1]} item={item} />)}</div>
          </div>
          <div className="buy-illustration"><div className="buy-illustration-glow" /><img src={bigCoinIcon} alt="A glowing stack of AG coins" /></div>
          <div className="buy-checkout">
            <div className="buy-checkout-title"><img src={agCoin} alt="" /><div><h2>Buy AG Coins</h2><p>Current balance: <b>{balance ?? "..."}</b></p></div></div>
            <div className="buy-presets">{[10, 50, 100, 500].map((preset) => <button key={preset} className={amount === preset ? "selected" : ""} onClick={() => { paymentAttemptId.current += 1; setAmount(preset); setStatus(null); setPaymentError(""); }}>₹{preset}</button>)}</div>
            <label className="buy-amount"><span>₹</span><input aria-label="Amount in rupees" type="number" min="1" max="5000" value={amount} onChange={(event) => { paymentAttemptId.current += 1; setAmount(Number(event.target.value)); setStatus(null); setPaymentError(""); }} /></label>
            <div className="buy-preview"><div><b>{coinsPreview.toLocaleString()} Coins</b><small>for ₹{amount || 0}</small></div><img src={coin50} alt="" /></div>
            {status === "success" ? <div className="buy-message success">Payment successful! Coins are being credited…</div> : status === "failed" ? <div className="buy-message error">Payment failed. {paymentError}<button className="mt-3 rounded-lg border border-white/30 px-3 py-2" onClick={() => handleBuy()}>Try again</button></div> : <button className="buy-submit" disabled={status === "processing" || amount < 1 || amount > 5000} onClick={() => handleBuy()}>{status === "processing" ? "Opening checkout…" : <>🛒 &nbsp; Buy Now — ₹{amount || 0}</>}</button>}
            <div className="buy-assurances"><span>♢ &nbsp;Secure Payments</span><i /><span>ϟ &nbsp;Instant Delivery</span></div>
          </div>
        </section>

        <section className="buy-packages">
          <h2><span />POPULAR PACKAGES<span /></h2>
          <div className="buy-package-grid">{TIERS.map((tier) => <article key={tier.amount} className={`buy-package ${amount === tier.amount ? "active" : ""}`}>
            {tier.badge && <span className="buy-package-badge" style={{ background: tier.color }}>{tier.badge}</span>}
            <button className="buy-package-main" onClick={() => { paymentAttemptId.current += 1; setAmount(tier.amount); setStatus(null); setPaymentError(""); }} aria-label={`Select ${tier.coins} coin package`}>
              <div className="buy-package-top"><img src={tier.img} alt="" /><span>→</span></div>
              <b>{tier.coins.toLocaleString()} Coins</b><small>{tier.copy}</small>
            </button>
            <div className="buy-package-bottom"><strong>₹{tier.amount}</strong><button disabled={status === "processing"} onClick={() => { setAmount(tier.amount); setStatus(null); setPaymentError(""); handleBuy(tier.amount); }} className={amount === tier.amount ? "selected" : ""}>🛒 &nbsp; Buy Now</button></div>
          </article>)}</div>
        </section>
        <div className="buy-trust-row"><div><span>ϟ</span><b>Instant Activation<small>Coins credited immediately</small></b></div><div><span>♢</span><b>Secure &amp; Trusted<small>100% safe payments</small></b></div><div><span>▤</span><b>Multiple Payment Options<small>UPI, Cards, Wallets &amp; more</small></b></div><div><span>★</span><b>Value for Learners<small>More practice, better results</small></b></div></div>
      </div>
      <style>{`
        .buy-coins-page{position:relative;isolation:isolate;overflow:hidden;margin:-1rem;padding:1.5rem 1.5rem 1rem;min-height:calc(100vh - 5rem);color:#f7f5ff;background:radial-gradient(ellipse at 68% 0%,rgba(42,40,209,.47),transparent 32%),radial-gradient(ellipse at 45% 40%,rgba(81,22,176,.16),transparent 38%),linear-gradient(130deg,#080d25,#0b102c 55%,#090e27)}
        .buy-coins-page:before{content:"";position:absolute;inset:0;z-index:-1;opacity:.32;background-image:linear-gradient(rgba(95,72,210,.11) 1px,transparent 1px),linear-gradient(90deg,rgba(95,72,210,.11) 1px,transparent 1px);background-size:74px 74px;mask-image:linear-gradient(to bottom,#000,transparent 75%)}
        .buy-coins-inner{max-width:1490px;margin:0 auto}.buy-hero{display:grid;grid-template-columns:minmax(400px,1.15fr) minmax(200px,.78fr) minmax(370px,.98fr);align-items:center;gap:1.3rem;padding:1.15rem 0 .55rem}.buy-hero-copy{padding:0 0 0 .15rem}.buy-kicker{display:inline-flex;align-items:center;gap:.5rem;border:1px solid #6739a9;border-radius:999px;background:#261642;color:#d391ff;padding:.42rem .8rem;font-size:.72rem;letter-spacing:.07em;font-weight:800}.buy-kicker img{width:16px;height:16px;object-fit:contain}.buy-hero h1{font-family:'Sora',sans-serif;font-size:clamp(2.8rem,4.5vw,4.5rem);line-height:.99;letter-spacing:-.055em;margin:1rem 0 .8rem;font-weight:900}.buy-hero h1 em{font-style:normal;background:linear-gradient(90deg,#823bff,#dd42de 60%,#ff70ae);background-clip:text;-webkit-background-clip:text;color:transparent}.buy-intro{max-width:560px;color:#c2c8e8;line-height:1.55;margin:0 0 1.55rem;font-size:.98rem}.buy-benefits{display:grid;grid-template-columns:1fr 1fr;gap:1rem .8rem}.buy-benefit{display:flex;gap:.7rem;align-items:center;min-width:0}.buy-benefit-icon{height:50px;width:50px;flex:none;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--benefit-color),transparent 30%);border-radius:17px;background:color-mix(in srgb,var(--benefit-color),transparent 78%);font-size:1.35rem;box-shadow:inset 0 0 20px color-mix(in srgb,var(--benefit-color),transparent 88%)}.buy-benefit b,.buy-benefit small{display:block}.buy-benefit b{font-size:.82rem}.buy-benefit small{color:#aeb7db;line-height:1.4;font-size:.74rem;margin-top:.25rem}.buy-illustration{position:relative;display:grid;place-items:center;min-width:0}.buy-illustration-glow{position:absolute;width:95%;height:70%;border-radius:50%;background:#5121fb;filter:blur(65px);opacity:.28}.buy-illustration img{z-index:1;width:min(100%,390px);max-height:400px;object-fit:contain;filter:drop-shadow(0 18px 24px rgba(70,30,255,.35))}.buy-checkout{border-radius:20px;padding:1.5rem 1.55rem 1.15rem;background:linear-gradient(145deg,rgba(17,22,51,.97),rgba(9,14,34,.96));border:1px solid #7141c7;box-shadow:0 20px 60px #05081788,0 0 28px #7d31ff17}.buy-checkout-title{display:flex;gap:.75rem;align-items:center;margin-bottom:1.25rem}.buy-checkout-title img{width:52px;height:52px;object-fit:contain}.buy-checkout-title h2{font-size:1.35rem;font-weight:800;margin:0}.buy-checkout-title p{font-size:.83rem;color:#b8bfde;margin:.15rem 0 0}.buy-checkout-title p b{color:#ffc22e}.buy-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:.6rem;margin-bottom:.8rem}.buy-presets button,.buy-package-bottom button{border:1px solid #343d67;background:#131b37;border-radius:9px;padding:.65rem .25rem;color:#e9eaff;font-size:.84rem;font-weight:700;transition:.18s}.buy-presets button:hover,.buy-package-bottom button:hover{border-color:#9261f8}.buy-presets button.selected,.buy-package-bottom button.selected{background:linear-gradient(100deg,#5344fb,#bb25e8);border-color:transparent;color:#fff;box-shadow:0 5px 18px #7e2cf455}.buy-amount{display:flex;align-items:center;gap:.5rem;padding:.68rem .85rem;border:1px solid #343d67;border-radius:10px;background:#121a35;color:#e4e8ff;font-size:1.1rem}.buy-amount input{width:100%;background:transparent;border:0;outline:0;color:inherit;font-size:1rem}.buy-amount input::-webkit-inner-spin-button{opacity:.5}.buy-preview{display:flex;justify-content:space-between;align-items:center;margin:.8rem 0 1rem;padding:.75rem 1rem;border:1px solid #40386e;border-radius:12px;background:linear-gradient(110deg,#1b1a3b,#121a34)}.buy-preview b,.buy-preview small{display:block}.buy-preview b{font-size:1.25rem;color:#bd8aff}.buy-preview small{font-size:.77rem;color:#b6bfdd;margin-top:.08rem}.buy-preview img{width:58px;height:58px;object-fit:contain}.buy-submit{width:100%;min-height:52px;border:0;border-radius:10px;background:linear-gradient(100deg,#5145ff,#bb20ed);color:white;font-size:1rem;font-weight:800;box-shadow:0 8px 24px #762fff44}.buy-submit:disabled{opacity:.65}.buy-message{border-radius:10px;padding:.85rem;font-size:.9rem}.buy-message.success{background:#164633;color:#b5f9d5}.buy-message.error{background:#54202d;color:#ffc1cc}.buy-assurances{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:1rem;color:#b9c1e2;font-size:.72rem}.buy-assurances i{height:15px;border-left:1px solid #414873}.buy-packages{padding-top:.35rem}.buy-packages>h2{display:flex;align-items:center;justify-content:center;gap:1.2rem;color:#b681ff;font-size:.78rem;letter-spacing:.19em;font-weight:800;margin:0 0 1rem}.buy-packages>h2 span{width:62px;height:1px;background:#7048bf}.buy-package-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1.2rem}.buy-package{position:relative;border:1px solid #273c8b;border-radius:17px;background:linear-gradient(145deg,#111936,#11152d);overflow:visible;transition:transform .2s,border-color .2s,box-shadow .2s}.buy-package:hover{transform:translateY(-3px)}.buy-package.active{border:2px solid #a239fa;background:linear-gradient(145deg,#251545,#151838);box-shadow:0 0 24px #992eff57}.buy-package-badge{position:absolute;top:-11px;left:18px;border-radius:999px;padding:.28rem .8rem;color:white;font-size:.7rem;font-weight:800;box-shadow:0 4px 12px #0005}.buy-package-main{width:100%;text-align:left;color:#f5f5ff;background:transparent;border:0;padding:.95rem 1.05rem .7rem}.buy-package-top{display:flex;align-items:center;justify-content:space-between;height:77px}.buy-package-top img{width:78px;height:72px;object-fit:contain}.buy-package-top span{width:37px;height:37px;border:1px solid #374275;color:#dbe2ff;border-radius:50%;display:grid;place-items:center;font-size:1.2rem}.buy-package-main>b{display:block;font-size:1.25rem;margin-top:.12rem}.buy-package-main>small{display:block;color:#b2bade;font-size:.8rem;margin-top:.1rem}.buy-package-bottom{display:flex;align-items:center;justify-content:space-between;padding:.55rem .9rem .65rem 1.05rem;border-top:1px solid #202a50;background:#10162e;border-radius:0 0 16px 16px}.buy-package-bottom strong{font-size:1.3rem}.buy-package-bottom button{min-width:45%;padding:.55rem .45rem;font-size:.76rem}.buy-trust-row{display:grid;grid-template-columns:repeat(4,1fr);padding:.85rem .4rem .1rem;margin-top:.25rem}.buy-trust-row>div{display:flex;align-items:center;justify-content:center;gap:.7rem;border-right:1px solid #28335c}.buy-trust-row>div:last-child{border:0}.buy-trust-row>div>span{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#20205a;color:#ca79ff;font-size:1.25rem}.buy-trust-row b{font-size:.75rem}.buy-trust-row small{display:block;color:#aeb9e4;font-size:.68rem;font-weight:400;margin-top:.15rem}
        @media(max-width:1100px){.buy-hero{grid-template-columns:minmax(0,1.1fr) minmax(330px,.9fr)}.buy-illustration{display:none}.buy-hero h1{font-size:3.5rem}.buy-package-grid{gap:.75rem}.buy-package-main{padding:.8rem}.buy-package-bottom{padding:.55rem .7rem}.buy-package-bottom button{min-width:50%}}
        @media(max-width:760px){.buy-coins-page{margin:-1rem;padding:1.25rem 1rem}.buy-hero{display:flex;flex-direction:column;align-items:stretch;padding-top:.2rem;gap:1.5rem}.buy-hero h1{font-size:clamp(2.75rem,12vw,4rem)}.buy-intro{font-size:.9rem}.buy-benefits{gap:.9rem .55rem}.buy-benefit{align-items:flex-start}.buy-benefit-icon{width:42px;height:42px;border-radius:14px;font-size:1.1rem}.buy-benefit b{font-size:.72rem}.buy-benefit small{font-size:.67rem}.buy-checkout{padding:1.2rem}.buy-package-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem .7rem}.buy-package-main>b{font-size:1.05rem}.buy-package-top img{width:65px}.buy-trust-row{grid-template-columns:repeat(2,1fr);gap:.9rem .3rem;margin-top:1rem}.buy-trust-row>div{border:0;justify-content:flex-start}.buy-trust-row>div>span{width:36px;height:36px}.buy-trust-row b{font-size:.68rem}}
        @media(max-width:390px){.buy-benefits{grid-template-columns:1fr}.buy-package-bottom{align-items:flex-start;flex-direction:column;gap:.45rem}.buy-package-bottom button{width:100%}.buy-trust-row{grid-template-columns:1fr}}
      `}</style>
      <style>{`[data-theme="aptigen"] .buy-coins-page{color:#172344;background:radial-gradient(ellipse at 70% 0%,rgba(108,94,255,.18),transparent 34%),radial-gradient(ellipse at 20% 58%,rgba(219,70,220,.08),transparent 38%),linear-gradient(130deg,#f4f6ff,#f8f4ff 55%,#f1f5ff)}
[data-theme="aptigen"] .buy-coins-page:before{opacity:.55;background-image:linear-gradient(rgba(93,75,180,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(93,75,180,.08) 1px,transparent 1px)}
[data-theme="aptigen"] .buy-intro,[data-theme="aptigen"] .buy-benefit small,[data-theme="aptigen"] .buy-checkout-title p,[data-theme="aptigen"] .buy-preview small,[data-theme="aptigen"] .buy-assurances,[data-theme="aptigen"] .buy-package-main>small,[data-theme="aptigen"] .buy-trust-row small{color:#586987}
[data-theme="aptigen"] .buy-benefit b,[data-theme="aptigen"] .buy-trust-row b{color:#1c2a4b}
[data-theme="aptigen"] .buy-checkout{background:linear-gradient(145deg,rgba(255,255,255,.98),rgba(247,248,255,.98));border-color:#cbb8f3;box-shadow:0 20px 55px rgba(74,72,140,.14),0 0 25px rgba(125,49,255,.08)}
[data-theme="aptigen"] .buy-checkout-title h2{color:#1c2344}
[data-theme="aptigen"] .buy-presets button,[data-theme="aptigen"] .buy-package-bottom button{background:#f1f2fb;border-color:#d3d7ec;color:#34415f}
[data-theme="aptigen"] .buy-amount{background:#f5f6fc;border-color:#d0d5e9;color:#263555}
[data-theme="aptigen"] .buy-preview{background:linear-gradient(110deg,#f2edff,#f1f5ff);border-color:#d8c9f6}
[data-theme="aptigen"] .buy-preview b{color:#7946c8}
[data-theme="aptigen"] .buy-packages>h2{color:#7041bd}
[data-theme="aptigen"] .buy-packages>h2 span{background:#b6a0e5}
[data-theme="aptigen"] .buy-package{background:linear-gradient(145deg,#fff,#f4f6ff);border-color:#c9d1f2;box-shadow:0 9px 24px rgba(70,84,140,.08)}
[data-theme="aptigen"] .buy-package.active{background:linear-gradient(145deg,#f5eaff,#edf0ff);border-color:#a239fa;box-shadow:0 0 22px rgba(153,46,255,.19)}
[data-theme="aptigen"] .buy-package-main{color:#202947}
[data-theme="aptigen"] .buy-package-bottom{background:#f1f3fc;border-color:#e0e4f3;color:#202947}
[data-theme="aptigen"] .buy-trust-row>div{border-color:#d4d9ee}
[data-theme="aptigen"] .buy-trust-row>div>span{background:#e8e5ff;color:#7545cf}`}</style>
    </div>
  );
}
