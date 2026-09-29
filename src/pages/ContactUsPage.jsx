import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useSupportStore } from "../store/supportStore";
import { useThemeStore } from "../store/themeStore";
import contactUsImage from "../assets/contactUs.png";

const categories = [
  { name: "Account", detail: "Login, profile, settings", icon: "♙", color: "text-sky-300" },
  { name: "Tests", detail: "Quizzes, results, doubts", icon: "▤", color: "text-violet-300" },
  { name: "Payments", detail: "Coins, subscriptions", icon: "▣", color: "text-fuchsia-300" },
  { name: "Technical issue", detail: "Bugs, errors, performance", icon: "⚙", color: "text-purple-300" },
];

const panel = "contact-panel rounded-2xl border border-slate-700/80 bg-gradient-to-br from-[#111c31] to-[#111629] shadow-[0_12px_36px_rgba(0,0,0,.2)]";
const field = "contact-field w-full rounded-lg border border-slate-600 bg-[#101a2d] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

function SendMessageCard() {
  const startChat = useSupportStore((s) => s.startChat);
  const sendMessage = useSupportStore((s) => s.sendMessage);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const fileRef = useRef(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true); setSendError("");
    try {
      const chat = await startChat(subject.trim(), `[${category || "General"} · ${priority} priority]\n\n${body.trim()}`);
      if (file) await sendMessage(chat.id, `Attachment: ${file.name}`, file);
      setSent(true); setSubject(""); setBody(""); setFile(null); if (fileRef.current) fileRef.current.value = "";
    } catch (error) { setSendError(error?.response?.data?.message || "Could not send your support request. Please try again."); }
    finally { setSending(false); }
  };

  return (
    <section className={`${panel} border-violet-500/80 p-5 sm:p-7`}>
      <div className="mb-5 flex items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl text-white shadow-lg shadow-violet-900/40">✉</div>
        <div><h2 className="font-hero text-xl font-bold text-slate-100">Send us a message</h2><p className="mt-1 text-sm text-slate-400">Fill out the form below and our support team will get back to you.</p></div>
      </div>
      {sent && <p className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Your support request was sent. You can follow the conversation in Live support.</p>}
      {sendError && <p role="alert" className="mb-4 rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{sendError}</p>}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-200">Subject<input className={`${field} mt-1.5`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter a short subject" /></label>
        <div className="grid gap-4 sm:grid-cols-[1.4fr_.7fr]">
          <label className="block text-sm font-medium text-slate-200">Issue category<select className={`${field} mt-1.5`} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Select a category</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-200">Priority<select className={`${field} mt-1.5`} value={priority} onChange={(e) => setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label>
        </div>
        <label className="block text-sm font-medium text-slate-200">Describe your issue<textarea className={`${field} mt-1.5 resize-y`} rows={4} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Provide details about your issue..." /><span className="mt-1 block text-right text-xs text-slate-500">{body.length}/1000</span></label>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950/20 p-3.5">
          <span className="text-xl text-slate-300">⌁</span><div className="min-w-0 flex-1"><p className="text-sm text-slate-200">Attach files <span className="text-slate-400">(optional)</span></p><p className="text-xs text-slate-400">Screenshots, logs, or other files (Max 5 MB)</p>{file && <p className="mt-1 truncate text-xs text-violet-300">{file.name}</p>}</div>
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} /><button type="button" onClick={() => fileRef.current?.click()} className="contact-upload rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700">↑ Upload File</button>
        </div>
        <button onClick={handleSubmit} disabled={sending || !subject.trim() || !body.trim()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">➤ <span>{sending ? "Sending…" : "Send Message"}</span></button>
        <p className="text-center text-sm text-slate-400">◷ &nbsp;We typically respond within 24 hours.</p>
      </div>
    </section>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.senderType === "USER";
  const attachmentSrc = msg.attachmentUrl?.startsWith("http") ? msg.attachmentUrl : `${(api.defaults.baseURL || "").replace(/\/api\/?$/, "")}${msg.attachmentUrl || ""}`;
  return <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${isUser ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "bg-slate-700/80 text-slate-100"}`}>
    {msg.message && <p className="whitespace-pre-wrap text-sm">{msg.message}</p>}
    {msg.attachmentUrl && msg.attachmentType === "image" && <a href={attachmentSrc} target="_blank" rel="noreferrer"><img src={attachmentSrc} alt="Support attachment" className="mt-2 max-h-64 max-w-full rounded-lg object-contain" /></a>}
    {msg.attachmentUrl && msg.attachmentType === "video" && <video src={attachmentSrc} controls className="mt-2 max-w-full rounded-lg" />}
    {msg.attachmentUrl && msg.attachmentType === "audio" && <audio src={attachmentSrc} controls className="mt-2 w-full" />}
    {msg.attachmentUrl && !["image", "video", "audio"].includes(msg.attachmentType) && <a href={attachmentSrc} target="_blank" rel="noreferrer" className="mt-2 block underline">Download {msg.attachmentName || "attachment"}</a>}
    <p className="mt-1 text-right text-[10px] opacity-60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
  </div></div>;
}

function ChatWidget() {
  const { chats, fetchChats, startChat, activeChat, openChat, messages, fetchMessages, sendMessage } = useSupportStore();
  const [issue, setIssue] = useState("");
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { fetchChats(); }, []);
  useEffect(() => { if (!activeChat) return; const interval = setInterval(() => fetchMessages(activeChat.id), 4000); return () => clearInterval(interval); }, [activeChat]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const handleStart = async () => { if (!issue.trim()) return; await startChat("Support request", issue); setIssue(""); };
  const handleSend = async () => { if (!draft.trim() && !file) return; await sendMessage(activeChat.id, draft, file); setDraft(""); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  return <section className={`${panel} flex min-h-[390px] flex-col p-4 sm:p-5`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan-400/15 text-xl text-cyan-300 shadow-[0_0_22px_rgba(34,211,238,.18)]">●</div><div><h2 className="font-hero text-lg font-bold text-slate-100">{activeChat ? activeChat.subject : "Live support"}</h2><p className="text-sm text-slate-400">{activeChat ? "Chat with our support team" : "Chat with our support team for quick assistance."}</p></div></div>
      <span className="shrink-0 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">● &nbsp;Online</span>
    </div>
    {!activeChat ? <>
      <div className="contact-inset flex flex-1 flex-col justify-center rounded-xl border border-slate-700/80 bg-[#0d1728]/70 p-4">
        {!chats.length && <div className="mb-4 text-center"><div className="mb-2 text-3xl">💬</div><p className="text-sm text-slate-300">Tell us what you need help with and we’ll be right with you.</p></div>}
        <textarea placeholder="What issue are you facing?" rows={3} className={`${field} resize-none`} value={issue} onChange={(e) => setIssue(e.target.value)} />
      </div>
      <button onClick={handleStart} disabled={!issue.trim()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-600 px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-50">➤ &nbsp;Start a conversation</button>
    </> : <>
      <div ref={scrollRef} className="contact-inset mb-3 max-h-[280px] min-h-[190px] flex-1 overflow-y-auto rounded-xl border border-slate-700/80 bg-[#0d1728]/70 p-3">{messages.length ? messages.map((msg) => <ChatMessage key={msg.id} msg={msg} />) : <p className="py-10 text-center text-sm text-slate-400">Your conversation is ready. Send us a message to get started.</p>}</div>
      {file && <div className="mb-2 text-xs text-violet-300">⌁ {file.name} <button onClick={() => setFile(null)} className="ml-2 text-rose-300">Remove</button></div>}
      <div className="contact-composer flex items-center gap-2 rounded-lg border border-slate-600 bg-[#101a2d] p-1.5"><input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} /><button aria-label="Attach file" className="rounded p-2 text-slate-300 hover:bg-slate-700" onClick={() => fileInputRef.current?.click()}>⌁</button><input type="text" placeholder="Type your message..." className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-100 outline-none placeholder:text-slate-400" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} /><button aria-label="Send message" className="rounded-lg bg-violet-600 px-3 py-2 text-white hover:bg-violet-500" onClick={handleSend}>➤</button></div>
    </>}
  </section>;
}

function RecentRequests() {
  const chats = useSupportStore((state) => state.chats);
  const { openChat } = useSupportStore();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(chats.length / 2);
  useEffect(() => setPage((current) => Math.min(current, Math.max(0, pageCount - 1))), [pageCount]);
  if (!chats.length) return null;
  return <section className={`${panel} p-4 sm:p-5`}>
    <div className="mb-3 flex items-center justify-between"><div><h2 className="font-hero font-bold text-slate-100">Your recent requests</h2><p className="text-sm text-slate-400">Track the status of your support requests.</p></div><span className="text-sm text-violet-300">{page + 1} / {pageCount}</span></div>
    <div className="space-y-2">{chats.slice(page * 2, page * 2 + 2).map((chat) => <button key={chat.id} onClick={() => openChat(chat)} className="contact-request-row flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-[#0d1728]/70 p-3 text-left hover:border-slate-500"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300">▤</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-100">{chat.subject}</span><span className="text-xs text-slate-400">Support request #{chat.id}</span></span><span className={`shrink-0 rounded-full border px-2 py-1 text-xs ${chat.status === "OPEN" ? "border-sky-500/40 bg-sky-500/10 text-sky-300" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"}`}>{chat.status === "OPEN" ? "In progress" : "Resolved"}</span><span className="text-slate-400">›</span></button>)}</div>
    {pageCount > 1 && <div className="mt-3 flex justify-end gap-2"><button className="btn btn-xs btn-outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="btn btn-xs btn-outline" disabled={page >= pageCount - 1} onClick={() => setPage((current) => current + 1)}>Next</button></div>}
  </section>;
}
export default function ContactUsPage() {
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme !== "dark";
  return <div data-theme={theme} className={`contact-page -m-4 min-h-full p-4 lg:-m-6 lg:p-6 ${isLight ? "contact-page-light bg-blue-50 text-slate-900" : "bg-[#090f1e] text-slate-100"}`}>
    <div className="mx-auto max-w-[1500px]">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><div className="flex flex-wrap items-center gap-3"><img src={contactUsImage} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" /><h1 className="font-hero text-3xl font-extrabold tracking-tight sm:text-4xl"><span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-500 bg-clip-text text-transparent">Contact Support</span></h1><span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">● &nbsp;We’re here to help</span></div><p className="mt-2 text-slate-300">Have an issue or a question? Our support team is ready to assist you.</p></div>
      <div className="hidden items-center gap-4 lg:flex"><div className="text-4xl text-blue-300">☏</div><p className="max-w-[240px] text-sm leading-relaxed text-slate-300">Get quick help, resolve issues,<br />and keep learning with AptiGen.</p></div>
    </header>
    <nav aria-label="Support topics" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{categories.map((item) => <a key={item.name} href={`#support-${item.name.toLowerCase().replaceAll(" ", "-")}`} className="contact-topic flex items-center gap-3 rounded-xl border border-slate-700 bg-gradient-to-br from-[#121d32] to-[#111629] px-4 py-3 transition hover:border-violet-400/70 hover:bg-slate-800"><span className={`contact-topic-icon grid h-11 w-11 place-items-center rounded-xl bg-slate-800 text-xl ${item.color}`}>{item.icon}</span><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-100">{item.name}</span><span className="block truncate text-xs text-slate-400">{item.detail}</span></span><span className="text-xl text-slate-400">›</span></a>)}</nav>
    <div className="grid items-start gap-5 xl:grid-cols-[1.05fr_.95fr]"><SendMessageCard /><div className="space-y-4"><ChatWidget /><RecentRequests /></div></div>
    </div>
  </div>;
}
