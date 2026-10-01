import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import AdminWorkspaceLayout from "../components/AdminWorkspaceLayout";
import folderIcon from "../assets/folder.png";
import testIcon from "../assets/test.png";

export default function AdminMockTestsPage() {
  const navigationStorageKey = "aptigen.admin.mock-tests.folder-navigation";
  const [catalog, setCatalog] = useState({ folders: [], tests: [] });
  const [currentFolderId, setCurrentFolderId] = useState(() => { try { return JSON.parse(localStorage.getItem(navigationStorageKey) || "{}").currentFolderId ?? null; } catch { return null; } });
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem(navigationStorageKey) || "{}").history || []; } catch { return []; } });
  const [search, setSearch] = useState("");
  const [folderName, setFolderName] = useState("");
  const [folderDialog, setFolderDialog] = useState(null);
  const [picker, setPicker] = useState(null);
  const [pickerViewId, setPickerViewId] = useState(null);
  const [error, setError] = useState("");
  const [folderSearchOpen, setFolderSearchOpen] = useState(false);

  const load = async () => {
    const { data } = await api.get("/mock-tests");
    setCatalog({ folders: data.folders || [], tests: data.tests || [] });
  };
  useEffect(() => { load().catch((err) => setError(err.response?.data?.message || "Could not load mock tests.")); }, []);
  useEffect(() => { localStorage.setItem(navigationStorageKey, JSON.stringify({ currentFolderId, history })); }, [currentFolderId, history]);

  const folderById = useMemo(() => new Map(catalog.folders.map((folder) => [folder.id, folder])), [catalog.folders]);
  const currentFolder = catalog.folders.find((folder) => folder.id === currentFolderId);
  const children = catalog.folders.filter((folder) => (folder.parentId ?? null) === currentFolderId);
  const folderPath = [];
  for (let folder = currentFolder; folder; folder = folderById.get(folder.parentId)) folderPath.unshift(folder);
  const query = search.trim().toLocaleLowerCase();
  const pathFor = (id) => {
    const path = [];
    for (let folder = folderById.get(id); folder; folder = folderById.get(folder.parentId)) path.unshift(folder.name);
    return path;
  };
  const isInsideCurrentFolder = (folderId) => {
    return currentFolderId != null && folderId === currentFolderId;
  };
  const visibleTests = catalog.tests.filter((test) => {
    const inCurrent = isInsideCurrentFolder(test.folderId);
    const searchable = `${test.title} ${pathFor(test.folderId).join(" ")}`.toLocaleLowerCase();
    return (query ? searchable.includes(query) : inCurrent);
  });
  const visibleFolders = query
    ? catalog.folders.filter((folder) => isInsideCurrentFolder(folder.parentId) && `${folder.name} ${pathFor(folder.parentId).join(" ")}`.toLocaleLowerCase().includes(query))
    : children;

  const openFolder = (id) => {
    if (id === currentFolderId) return;
    setHistory((items) => [...items, currentFolderId]);
    setCurrentFolderId(id);
    setSearch("");
  };
  const goBack = () => {
    if (!history.length) return;
    setCurrentFolderId(history[history.length - 1]);
    setHistory((items) => items.slice(0, -1));
  };
  const submitFolder = async (event) => {
    event.preventDefault();
    if (!folderName.trim()) return;
    try {
      if (folderDialog?.type === "rename") await api.patch(`/admin/mock-folders/${folderDialog.folder.id}`, { name: folderName.trim(), parentId: folderDialog.folder.parentId ?? null });
      else await api.post("/admin/mock-folders", { name: folderName.trim(), parentId: currentFolderId });
      setFolderName(""); setFolderDialog(null); setError(""); await load();
    } catch (err) { setError(err.response?.data?.message || "Could not save mock folder."); }
  };
  const renameFolder = (folder) => { setFolderName(folder.name); setFolderDialog({ type: "rename", folder }); };
  const deleteFolder = async (folder) => {
    if (!window.confirm(`Delete “${folder.name}” and its subfolders?`)) return;
    try { await api.delete(`/admin/mock-folders/${folder.id}`); setCurrentFolderId(null); setHistory([]); setError(""); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete mock folder."); }
  };
  const renameTest = async (test) => {
    const title = window.prompt(`Rename “${test.title}”:`, test.title);
    if (title === null || !title.trim() || title.trim() === test.title) return;
    try { await api.patch(`/tests/${test.id}/rename`, { title: title.trim() }); setError(""); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not rename mock test."); }
  };
  const removeTest = async (test) => {
    if (!window.confirm(`Remove “${test.title}” from mock tests?`)) return;
    try { await api.delete(`/admin/mock-tests/${test.id}/publish`); setError(""); await load(); }
    catch (err) { setError(err.response?.data?.message || "Could not remove mock test."); }
  };
  const isDescendant = (candidateId, parentId) => {
    for (let folder = folderById.get(candidateId); folder; folder = folderById.get(folder.parentId)) if (folder.id === parentId) return true;
    return false;
  };
  const pickerFolders = catalog.folders.filter((folder) => (folder.parentId ?? null) === pickerViewId && (!picker?.folder || (folder.id !== picker.folder.id && !isDescendant(folder.id, picker.folder.id))));
  const pickerView = folderById.get(pickerViewId);
  const pickerPath = [];
  for (let folder = pickerView; folder; folder = folderById.get(folder.parentId)) pickerPath.unshift(folder);
  const openPicker = (type, item) => { setPicker({ type, item, folder: type === "folder" ? item : null }); setPickerViewId(null); };
  const chooseDestination = async (folderId) => {
    try {
      if (picker.type === "test") await api.post(`/admin/mock-tests/${picker.item.id}/publish`, { folderId });
      else await api.patch(`/admin/mock-folders/${picker.item.id}`, { name: picker.item.name, parentId: folderId });
      setPicker(null); setError(""); await load();
    } catch (err) { setError(err.response?.data?.message || "Could not move mock item."); }
  };

  return <AdminWorkspaceLayout title="Add Mock Test">
    <div className="my-tests-page admin-mock-workspace">
      <div className="my-tests-hero relative mb-6 overflow-hidden rounded-2xl p-6 lg:p-8"><div className="relative z-10 flex items-center justify-between gap-6"><div><span className="badge badge-primary mb-3">Admin mock library</span><h1 className="font-hero text-4xl font-extrabold text-white sm:text-5xl">Mock <span className="text-secondary">Tests</span></h1><p className="mt-3 max-w-lg text-sm text-white/70 sm:text-base">Organize and publish admin-created tests into folders and subfolders.</p></div><Link to="/admin/generate" className="btn border-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">+ Generate Test</Link></div></div>
      <div className="my-tests-toolbar mb-5 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row"><label className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-base-300 px-4"><span className="opacity-50">⌕</span><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search folders and mock tests..." value={search} onChange={(event) => setSearch(event.target.value)} /></label><button className="btn btn-outline" onClick={() => { setFolderName(""); setFolderDialog({ type: "create" }); }}>+ New folder</button></div>
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}
      <section className="my-tests-folder-panel relative mb-5 overflow-hidden rounded-2xl border p-4"><div className="relative z-10"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><button className="btn btn-sm btn-outline" disabled={!history.length} onClick={goBack}>← Back</button><button className={`my-tests-folder-crumb ${currentFolderId == null ? "is-current" : ""}`} onClick={() => { setCurrentFolderId(null); setHistory([]); }}>Mock folders</button>{folderPath.map((folder) => <span key={folder.id} className="flex items-center gap-2"><span>/</span><button className={`my-tests-folder-crumb ${currentFolderId === folder.id ? "is-current" : ""}`} onClick={() => openFolder(folder.id)}>{folder.name}</button></span>)}</div><div className="flex items-center gap-2">{folderSearchOpen && <input autoFocus className="input input-sm input-bordered w-48 bg-base-100/80" placeholder="Search this folder..." value={search} onChange={(event) => setSearch(event.target.value)} />}{folderSearchOpen && <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setSearch(""); setFolderSearchOpen(false); }}>×</button>}<button type="button" className="btn btn-sm btn-outline" onClick={() => setFolderSearchOpen((open) => !open)}>⌕ Search</button></div></div>
        {visibleFolders.length > 0 && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{visibleFolders.map((folder) => <div key={folder.id} className="my-tests-folder-card relative rounded-xl border p-3"><button className="w-full pr-2 text-left" onClick={() => openFolder(folder.id)}><img src={folderIcon} alt="" className="mr-3 inline-block h-12 w-12 object-contain" /><span className="font-semibold">{folder.name}</span><span className="mt-1 block text-xs opacity-70">Open folder →</span></button><div className="mt-3 flex flex-wrap gap-1"><button className="btn btn-xs btn-outline" onClick={() => openPicker("folder", folder)}>Move to</button><button className="btn btn-xs btn-ghost" onClick={() => renameFolder(folder)}>Rename</button><button className="btn btn-xs btn-ghost text-error" onClick={() => deleteFolder(folder)}>Delete</button></div></div>)}</div>}
        <div className="mt-6"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-primary">Mock test collection</p><h2 className="font-hero text-2xl font-bold">{visibleTests.length} tests</h2></div></div>{visibleTests.length ? <div className="my-test-card-grid grid gap-5 xl:grid-cols-2">{visibleTests.map((test) => <article key={test.id} className="my-test-card card bg-base-100 p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><img src={testIcon} alt="" className="h-12 w-12 object-contain" /><div className="min-w-0"><h3 className="truncate font-hero text-lg font-bold">{test.title}</h3><p className="text-xs text-base-content/55">{test.questionCount} questions · {pathFor(test.folderId).join(" / ") || "Recent tests"}</p></div></div><button className="btn btn-ghost btn-sm" onClick={() => openPicker("test", test)}>↗</button></div><div className="mt-5 flex flex-wrap gap-2"><button className="btn btn-sm btn-outline" onClick={() => openPicker("test", test)}>Move to</button><button className="btn btn-sm btn-outline" onClick={() => renameTest(test)}>Rename</button><button className="btn btn-sm btn-outline text-error" onClick={() => removeTest(test)}>Delete</button><Link to={`/take-test/${test.id}`} className="btn btn-sm border-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white">Open test →</Link></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-base-300 p-12 text-center text-base-content/55">No mock tests in this folder.</div>}</div></div></section>
      {folderDialog && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><form onSubmit={submitFolder} className="card w-full max-w-md bg-base-100 p-5"><h2 className="font-hero text-xl font-bold">{folderDialog.type === "rename" ? "Rename mock folder" : currentFolderId ? "Create subfolder" : "Create mock folder"}</h2><input autoFocus className="input input-bordered mt-4 w-full" value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Folder name" /><div className="mt-4 flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={() => setFolderDialog(null)}>Cancel</button><button className="btn btn-primary">Save</button></div></form></div>}
      {picker && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><section className="card w-full max-w-md bg-base-100 p-5"><h2 className="font-hero text-xl font-bold">{picker.type === "test" ? "Move mock test to" : "Move folder to"}</h2><p className="mt-1 truncate text-sm opacity-60">{picker.item.name || picker.item.title}</p><div className="my-4 flex flex-wrap gap-1 text-sm"><button className="link link-primary" onClick={() => setPickerViewId(null)}>Mock folders</button>{pickerPath.map((folder) => <span key={folder.id}> / <button className="link link-primary" onClick={() => setPickerViewId(folder.id)}>{folder.name}</button></span>)}</div><button className="btn btn-outline mb-2 w-full justify-start" onClick={() => chooseDestination(null)}>📁 Move to top level</button>{pickerFolders.map((folder) => <button key={folder.id} className="btn btn-ghost w-full justify-start" onClick={() => setPickerViewId(folder.id)}>📁 {folder.name}<span className="ml-auto">Open →</span></button>)}{pickerViewId && <button className="btn btn-primary mt-3 w-full" onClick={() => chooseDestination(pickerViewId)}>Choose “{pickerView?.name}”</button>}<button className="btn btn-ghost mt-2 w-full" onClick={() => setPicker(null)}>Cancel</button></section></div>}
    </div>
  </AdminWorkspaceLayout>;
}
