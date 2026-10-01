import { NavLink, Link } from "react-router-dom";

const links = [
  ["/admin", "Overview"],
  ["/admin/generate", "Generate Test"],
  ["/admin/tests", "My Tests"],
  ["/admin/contests", "Add Contest"],
  ["/admin/mock-tests", "Add Mock Test"],
];

export default function AdminWorkspaceLayout({ title, children }) {
  return <div className="min-h-screen bg-[#080d19] text-slate-100 lg:flex">
    <aside className="w-full shrink-0 border-b border-white/10 bg-gradient-to-b from-[#101637] to-[#070d20] p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-b-0 lg:border-r">
      <Link to="/admin" className="block border-b border-white/10 px-2 pb-6"><span className="text-2xl font-black">Apti<span className="text-violet-400">Gen</span></span><span className="mt-1 block text-[9px] uppercase tracking-[.3em] text-slate-500">Control room</span></Link>
      <nav className="mt-6 grid grid-cols-2 gap-1.5 lg:block lg:space-y-1.5">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/admin"} className={({ isActive }) => `block rounded-xl px-3 py-2.5 text-sm ${isActive ? "bg-violet-600/40 font-semibold text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{label}</NavLink>)}</nav>
    </aside>
    <main className="min-w-0 flex-1 p-4 lg:ml-60 lg:p-8"><div className="mx-auto max-w-7xl"><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.25em] text-violet-300">AptiGen control room</p><h1 className="mt-1 text-3xl font-extrabold">{title}</h1></div>{children}</div></main>
  </div>;
}
