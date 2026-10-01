import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import folderIcon from "../assets/folder.png";

export default function MockTestsPage() {
  const navigationStorageKey = "aptigen.mock-tests.folder-navigation";
  const [catalog, setCatalog] = useState({ folders: [], tests: [] });
  const [query, setQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState(() => { try { return JSON.parse(localStorage.getItem(navigationStorageKey) || "{}").currentFolderId ?? null; } catch { return null; } });
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem(navigationStorageKey) || "{}").history || []; } catch { return []; } });
  const [sort, setSort] = useState("NEWEST");
  const [visibleCount, setVisibleCount] = useState(6);
  const [error, setError] = useState("");
  const [folderSearchOpen, setFolderSearchOpen] = useState(false);

  useEffect(() => {
    api.get("/mock-tests").then(({ data }) => setCatalog({ folders: data.folders || [], tests: data.tests || [] }))
      .catch((err) => setError(err.response?.data?.message || "Could not load mock tests."));
  }, []);
  useEffect(() => { localStorage.setItem(navigationStorageKey, JSON.stringify({ currentFolderId, history })); }, [currentFolderId, history]);

  const folderById = useMemo(() => new Map(catalog.folders.map((folder) => [folder.id, folder])), [catalog.folders]);
  const currentFolder = folderById.get(currentFolderId);
  const childFolders = catalog.folders.filter((folder) => (folder.parentId ?? null) === currentFolderId);
  const folderPath = [];
  for (let folder = currentFolder; folder; folder = folderById.get(folder.parentId)) folderPath.unshift(folder);
  const folderPathText = (folderId) => {
    const path = [];
    for (let folder = folderById.get(folderId); folder; folder = folderById.get(folder.parentId)) path.unshift(folder.name);
    return path.join(" ");
  };
  const isInsideCurrentFolder = (folderId) => {
    return currentFolderId != null && folderId === currentFolderId;
  };
  const term = query.trim().toLocaleLowerCase();
  const matchingFolders = term ? catalog.folders.filter((folder) => (currentFolderId == null || isInsideCurrentFolder(folder.parentId) || folder.parentId === currentFolderId) && `${folder.name} ${folderPathText(folder.parentId)}`.toLocaleLowerCase().includes(term)) : childFolders;
  const visibleTests = useMemo(() => catalog.tests
    .filter((test) => isInsideCurrentFolder(test.folderId))
    .filter((test) => !term || `${test.title} ${folderPathText(test.folderId)}`.toLocaleLowerCase().includes(term))
    .sort((a, b) => sort === "NAME" ? a.title.localeCompare(b.title) : new Date(b.createdAt) - new Date(a.createdAt)), [catalog.tests, currentFolderId, sort, term]);
  const displayedTests = visibleTests.slice(0, visibleCount);
  useEffect(() => { setVisibleCount(6); }, [currentFolderId, term, sort]);

  const openFolder = (folderId) => { setHistory((items) => [...items, currentFolderId]); setCurrentFolderId(folderId); setQuery(""); };
  const goBack = () => { if (!history.length) return; setCurrentFolderId(history[history.length - 1]); setHistory((items) => items.slice(0, -1)); };
  const goRoot = () => { setCurrentFolderId(null); setHistory([]); setQuery(""); };

  return <main className="mock-tests-page mx-auto max-w-7xl space-y-6 pb-10">
    <header className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-[#111a43] via-[#171544] to-[#32105b] p-6 shadow-2xl sm:p-9"><div className="relative z-10 max-w-2xl"><span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-200">AptiGen library</span><h1 className="mt-4 font-hero text-3xl font-extrabold text-white sm:text-5xl">Mock Tests</h1><p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">Browse admin-curated folders, practice tests, and timed challenges. Each test costs one coin per question when you start it.</p></div><div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" /></header>
    <section className="rounded-2xl border border-base-300 bg-base-100/70 p-4 shadow-xl sm:p-5"><div className="flex flex-col gap-3 lg:flex-row"><label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-4"><span className="opacity-50">⌕</span><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search folders, subfolders, and mock tests..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select className="select select-bordered min-h-12" value={sort} onChange={(event) => setSort(event.target.value)}><option value="NEWEST">Newest first</option><option value="NAME">Name A-Z</option></select></div></section>
    {error && <div className="alert alert-error">{error}</div>}
    <section className="my-tests-folder-panel relative overflow-hidden rounded-2xl border p-4 sm:p-5"><div className="relative z-10"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><button type="button" className="btn btn-sm btn-outline" disabled={!history.length} onClick={goBack}>← Back</button><button type="button" className={`my-tests-folder-crumb ${currentFolderId === null ? "is-current" : ""}`} onClick={goRoot}>Mock folders</button>{folderPath.map((folder) => <span key={folder.id} className="flex items-center gap-2"><span className="opacity-50">/</span><button type="button" className={`my-tests-folder-crumb ${folder.id === currentFolderId ? "is-current" : ""}`} onClick={() => openFolder(folder.id)}>{folder.name}</button></span>)}</div><div className="flex items-center gap-2">{folderSearchOpen && <input autoFocus className="input input-sm input-bordered w-48 bg-base-100/80" placeholder="Search this folder..." value={query} onChange={(event) => setQuery(event.target.value)} />}{folderSearchOpen && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setQuery(""); setFolderSearchOpen(false); }}>×</button>}<button type="button" className="btn btn-sm btn-outline" onClick={() => setFolderSearchOpen((open) => !open)}>⌕ Search</button></div></div>
      {matchingFolders.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{matchingFolders.map((folder) => <button type="button" key={folder.id} className="my-tests-folder-card rounded-xl border p-4 text-left" onClick={() => openFolder(folder.id)}><img src={folderIcon} alt="" className="mb-2 h-12 w-12 object-contain" /><span className="font-semibold">{folder.name}</span><span className="mt-1 block text-xs opacity-70">Open folder →</span>{term && <span className="mt-2 block text-xs opacity-50">{folderPathText(folder.parentId) || "Mock folders"}</span>}</button>)}</div>}
      <div className="mt-6"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Practice library</p><h2 className="mt-1 font-hero text-2xl font-bold">{visibleTests.length} mock tests</h2></div></div>{visibleTests.length ? <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{displayedTests.map((test) => <article key={test.id} className="rounded-2xl border border-violet-400/25 bg-gradient-to-br from-[#121b3b] to-[#1b1240] p-5 text-white shadow-lg transition hover:-translate-y-1 hover:border-violet-400/70"><p className="text-xs text-violet-300">{folderPathText(test.folderId) || "AptiGen Mock Tests"}</p><h3 className="mt-3 truncate font-hero text-xl font-bold">{test.title}</h3><div className="mt-4 flex items-center justify-between text-sm text-slate-300"><span>📝 {test.questionCount} questions</span><span>🪙 {test.questionCount} coins</span></div><Link to={`/take-test/${test.id}`} className="mt-5 block rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 text-center font-semibold text-white">Start mock test →</Link></article>)}</div>{visibleCount < visibleTests.length && <button type="button" className="btn btn-outline mx-auto mt-5 block" onClick={() => setVisibleCount((count) => count + 6)}>Show more tests</button>}</> : <div className="rounded-2xl border border-dashed border-base-300 p-12 text-center text-base-content/55">No mock tests in this folder.</div>}</div></div></section>
  </main>;
}
