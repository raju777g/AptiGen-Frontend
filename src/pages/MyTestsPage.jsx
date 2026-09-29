import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTestStore } from "../store/testStore";
import { useDashboardStore } from "../store/dashboardStore";
import docIllustration from "../assets/icon-doc-ilus.png";
import folderIcon from "../assets/folder.png";
import testIcon from "../assets/test.png";
import folderClickSound from "../assets/folderClick.wav";
import { openTestPdf } from "../utils/testPdf";

function StatCard({ icon, value, label, color }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ backgroundColor: color + "12", border: `1px solid ${color}35` }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: color + "25" }}>
        {icon}
      </div>
      <div>
        <div className="font-hero font-bold text-xl leading-tight">{value}</div>
        <div className="text-xs text-base-content/50">{label}</div>
      </div>
    </div>
  );
}

function TestCard({ test, onPublish, onDelete, onMove, onDownload, folderLabel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);
  const cardRef = useRef(null);
  const clickTimerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(clickTimerRef.current), []);

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch" || !cardRef.current) return;
    const bounds = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    cardRef.current.style.setProperty("--test-tilt-x", `${-y * 7}deg`);
    cardRef.current.style.setProperty("--test-tilt-y", `${x * 9}deg`);
    cardRef.current.style.setProperty("--test-glow-x", `${(x + 0.5) * 100}%`);
    cardRef.current.style.setProperty("--test-glow-y", `${(y + 0.5) * 100}%`);
  };

  const resetCardTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--test-tilt-x", "0deg");
    cardRef.current.style.setProperty("--test-tilt-y", "0deg");
  };

  const pulseCard = () => {
    window.clearTimeout(clickTimerRef.current);
    setClickPulse(true);
    clickTimerRef.current = window.setTimeout(() => setClickPulse(false), 320);
  };

  return (
    <article
      ref={cardRef}
      className={`my-test-card card bg-base-100 p-5 sm:p-6 ${clickPulse ? "is-clicking" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetCardTilt}
      onClick={pulseCard}
    >
      <div className="my-test-card-top mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="my-test-card-icon grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
            <img src={testIcon} alt="" className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-hero text-lg font-bold sm:text-xl">{test.title}</h3>
            {folderLabel && <p className="truncate text-[11px] text-primary/80">{folderLabel}</p>}
            <p className="mt-1 flex items-center gap-1.5 text-xs text-base-content/50">
              <span aria-hidden="true">&#128197;</span>
              Created {new Date(test.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`my-test-visibility badge badge-sm gap-1 ${test.isPublic ? "badge-success" : "badge-ghost"}`}>
            {test.isPublic ? <><span aria-hidden="true">&#127760;</span> Public</> : <><span aria-hidden="true">&#128274;</span> Private</>}
          </span>
          <div className="relative">
            <button type="button" aria-label={`Options for ${test.title}`} className="btn btn-ghost btn-sm btn-circle" onClick={() => setMenuOpen((open) => !open)}>&#8942;</button>
            {menuOpen && (
              <ul className="absolute right-0 z-30 mt-1 menu w-40 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
                <li><button className="text-sm" onClick={() => { setMenuOpen(false); onMove(test); }}><img src={folderIcon} alt="" className="mr-2 inline-block h-5 w-5 object-contain" />Move to</button></li>
                <li><button className="text-sm text-error" onClick={() => { setMenuOpen(false); onDelete(test); }}>&#128465; Delete</button></li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="my-test-card-metrics mb-5 grid grid-cols-3 rounded-2xl border border-base-300/70 px-2 py-3">
        <div className="my-test-card-metric flex min-w-0 items-center gap-2 px-2">
          <span className="my-test-metric-icon">&#128218;</span>
          <div className="min-w-0"><div className="truncate text-xs font-semibold sm:text-sm">{test.timerMode}</div><div className="text-[10px] text-base-content/50 sm:text-xs">Timer Mode</div></div>
        </div>
        <div className="my-test-card-metric flex min-w-0 items-center gap-2 px-2">
          <span className="my-test-metric-icon">&#128339;</span>
          <div className="min-w-0"><div className="text-xs font-semibold sm:text-sm">{test.secondsPerQuestion}s</div><div className="text-[10px] text-base-content/50 sm:text-xs">per question</div></div>
        </div>
        <div className="my-test-card-metric flex min-w-0 items-center gap-2 px-2">
          <span className="my-test-metric-icon">&#128196;</span>
          <div className="min-w-0"><div className="text-xs font-semibold sm:text-sm">{test.questionCount}</div><div className="text-[10px] text-base-content/50 sm:text-xs">questions</div></div>
        </div>
      </div>

      <div className="my-test-card-actions grid grid-cols-2 gap-3">
        {!test.isPublic ? (
          <button className="my-test-publish-button btn btn-outline" onClick={() => onPublish(test.id)}>&#8593; Publish</button>
        ) : (
          <button className="my-test-publish-button btn btn-outline" disabled>&#127760; Live</button>
        )}
        <Link to={`/take-test/${test.id}`} className="my-test-take-button btn border-0 text-white">&#9654; Take Test &#8594;</Link>
        <button type="button" className="my-test-download-button btn btn-ghost col-span-2" onClick={() => onDownload(test)}>&#8681; Download PDF</button>
      </div>
    </article>
  );
}
function FolderCard({ folder, isRecent = false, opening = false, onMenuVisibility, onOpen, onMove, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    onMenuVisibility(menuOpen ? folder.id : null);
    if (!menuOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target) && !event.target.closest(".folder-card-floating-menu")) setMenuOpen(false);
    };
    const closeOnEscape = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    const closeFromPage = () => setMenuOpen(false);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mytests-close-folder-menu", closeFromPage);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mytests-close-folder-menu", closeFromPage);
    };
  }, [menuOpen, folder.id, onMenuVisibility]);
  return (
    <div className={`my-tests-folder-card relative rounded-xl border p-3 ${isRecent ? "my-tests-recent-folder" : ""} ${opening ? "folder-opening" : ""}`}>
      <button type="button" onClick={onOpen} className="w-full text-left pr-8">
        <img src={folderIcon} alt="" className="mr-2 inline-block h-5 w-5 object-contain" />
        <span className="font-semibold">{folder.name}</span>
        <span className="block text-xs opacity-70 mt-1">Open folder →</span>
      </button>
      <div ref={menuRef} className="folder-card-menu absolute right-2 top-2">
        <button ref={menuButtonRef} type="button" aria-label={`Options for ${folder.name}`} className="btn btn-ghost btn-xs btn-circle" onClick={() => { const rect = menuButtonRef.current?.getBoundingClientRect(); if (rect) setMenuPosition({ top: Math.min(rect.bottom + 6, window.innerHeight - 150), left: Math.max(8, Math.min(rect.right - 160, window.innerWidth - 168)) }); setMenuOpen((open) => !open); }}>⋮</button>
        {menuOpen && createPortal(<ul style={{ position: "fixed", top: menuPosition.top, left: menuPosition.left }} className="folder-card-floating-menu menu bg-base-100 rounded-box shadow-2xl w-40 p-1 border border-base-300 z-[100]">
          <li><button onClick={() => { setMenuOpen(false); onMove(folder); }}>↗ Move to</button></li>
          {!isRecent && <>
            <li><button onClick={() => { setMenuOpen(false); onRename(folder); }}>✎ Rename</button></li>
            <li><button className="text-error" onClick={() => { setMenuOpen(false); onDelete(folder); }}>⌫ Delete</button></li>
          </>}
          {isRecent && <li><span className="text-xs opacity-60">System folder</span></li>}
        </ul>, document.body)}
      </div>
    </div>
  );
}

export default function MyTestsPage() {
  const { myTests, testFolders, fetchMyTests, fetchTestFolders, createTestFolder, moveTestToFolder, moveTestFolder, renameTestFolder, deleteTestFolder, publishTest, deleteTest } = useTestStore();
  const { stats, fetchStats } = useDashboardStore();
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("TIME");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [currentFolderId, setCurrentFolderId] = useState(() => { try { return JSON.parse(localStorage.getItem("aptigen.mytests.folder-navigation") || "{}").currentFolderId ?? null; } catch { return null; } });
  const [folderHistory, setFolderHistory] = useState(() => { try { return JSON.parse(localStorage.getItem("aptigen.mytests.folder-navigation") || "{}").folderHistory || []; } catch { return []; } });
  const [openFolderMenuId, setOpenFolderMenuId] = useState(null);
  const [folderDialog, setFolderDialog] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [moveTest, setMoveTest] = useState(null);
  const [moveFolder, setMoveFolder] = useState(null);
  const [moveRecent, setMoveRecent] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [moveFolderViewId, setMoveFolderViewId] = useState(null);
  const [folderRipple, setFolderRipple] = useState(null);
  const [zoomFolderId, setZoomFolderId] = useState(null);
  const folderOpenTimerRef = useRef(null);
  const folderPanelRef = useRef(null);

  useEffect(() => {
    fetchMyTests();
    fetchTestFolders();
    fetchStats();
  }, []);

  useEffect(() => { localStorage.setItem("aptigen.mytests.folder-navigation", JSON.stringify({ currentFolderId, folderHistory })); }, [currentFolderId, folderHistory]);

  useEffect(() => {
    setVisibleCount(4);
  }, [search, visibilityFilter, sortBy, currentFolderId]);

  const handleDelete = async (test) => {
    if (!window.confirm(`Delete "${test.title}"? This can't be undone.`)) return;
    try {
      await deleteTest(test.id);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this test");
    }
  };

  const handleDownloadPdf = async (test) => {
    setError("");
    try { await openTestPdf(test.id); }
    catch (err) { setError(err.response?.data?.message || err.message || "Could not prepare this test PDF"); }
  };

  const searching = Boolean(search.trim());
  const query = search.trim().toLocaleLowerCase();
  const folderById = new Map(testFolders.map((folder) => [folder.id, folder]));
  const getFolderPath = (folderId) => {
    const path = [];
    for (let folder = folderById.get(folderId); folder; folder = folderById.get(folder.parentId)) path.unshift(folder.name);
    return path;
  };
  const folderMatches = searching ? testFolders.filter((folder) => folder.name.toLocaleLowerCase().includes(query)) : [];
  const filtered = myTests
    .filter((t) => searching || (currentFolderId === "recent" ? (t.folderId ?? null) === null : currentFolderId != null && (t.folderId ?? null) === currentFolderId))
    .filter((t) => !searching || `${t.title} ${getFolderPath(t.folderId).join(" ")} ${t.folderId == null ? "recent tests" : ""}`.toLocaleLowerCase().includes(query))
    .filter((t) => visibilityFilter === "ALL" || (visibilityFilter === "PUBLIC" ? t.isPublic : !t.isPublic))
    .sort((a, b) => {
      if (sortBy === "NAME") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "COINS") return (b.questionCount || 0) - (a.questionCount || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const visibleTests = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const currentFolder = currentFolderId === "recent" ? { id: "recent", name: "Recent tests", parentId: null, system: true } : testFolders.find((folder) => folder.id === currentFolderId);
  const childFolders = currentFolderId === "recent" ? [] : testFolders.filter((folder) => (folder.parentId ?? null) === currentFolderId);
  const folderPath = [];
  for (let folder = currentFolder; folder; folder = testFolders.find((item) => item.id === folder.parentId)) folderPath.unshift(folder);

  const submitFolder = async (event) => {
    event.preventDefault();
    if (!folderName.trim()) return;
    try {
      if (folderDialog.type === "rename") await renameTestFolder(folderDialog.folder.id, folderName.trim());
      else await createTestFolder({ name: folderName.trim(), parentId: currentFolderId === "recent" ? null : currentFolderId });
      setFolderName("");
      setFolderDialog(null);
    } catch (err) { setError(err.response?.data?.message || "Could not save folder"); }
  };

  const handleMove = async (folderId) => {
    try { await moveTestToFolder(moveTest.id, folderId); setMoveTest(null); }
    catch (err) { setError(err.response?.data?.message || "Could not move test"); }
  };

  const openMovePicker = (test) => {
    setMoveFolderViewId(null);
    setMoveFolder(null);
    setMoveRecent(false);
    setMoveTest(test);
  };

  const openFolderMovePicker = (folder) => {
    setMoveFolderViewId(null);
    setMoveTest(null);
    setMoveRecent(false);
    setMoveFolder(folder);
  };

  const openRecentMovePicker = () => { setMoveFolderViewId(null); setMoveTest(null); setMoveFolder(null); setMoveRecent(true); };

  const finishMoveFolder = async (parentId) => {
    try { await moveTestFolder(moveFolder.id, parentId); setMoveFolder(null); }
    catch (err) { setError(err.response?.data?.message || "Could not move folder"); }
  };

  const moveAllRecentTests = async (folderId) => {
    try {
      await Promise.all(myTests.filter((test) => test.folderId == null).map((test) => moveTestToFolder(test.id, folderId)));
      setMoveRecent(false);
    } catch (err) { setError(err.response?.data?.message || "Could not move recent tests"); }
  };

  const openRenameFolder = (folder) => { setFolderName(folder.name); setFolderDialog({ type: "rename", folder }); };
  const confirmDeleteFolder = async () => {
    try { await deleteTestFolder(folderToDelete.id); setFolderToDelete(null); if (folderPath.some((folder) => folder.id === folderToDelete.id)) { setCurrentFolderId(null); setFolderHistory([]); } }
    catch (err) { setError(err.response?.data?.message || "Could not delete folder"); }
  };

  const isDescendantOf = (candidateId, folderId) => {
    for (let folder = folderById.get(candidateId); folder; folder = folderById.get(folder.parentId)) if (folder.id === folderId) return true;
    return false;
  };
  const moveFolderChildren = testFolders.filter((folder) => (folder.parentId ?? null) === moveFolderViewId && (!moveFolder || (folder.id !== moveFolder.id && !isDescendantOf(folder.id, moveFolder.id))));
  const moveFolderView = folderById.get(moveFolderViewId);
  const moveFolderPath = [];
  for (let folder = moveFolderView; folder; folder = folderById.get(folder.parentId)) moveFolderPath.unshift(folder);
  const searchFolderResults = searching ? [
    ...("recent tests".includes(query) ? [{ id: "recent", name: "Recent tests", parentId: null, system: true }] : []),
    ...folderMatches,
  ] : [];
  const activeFolderMenu = openFolderMenuId === "recent"
    ? { id: "recent", name: "Recent tests", system: true }
    : testFolders.find((folder) => folder.id === openFolderMenuId);
  const closeFolderMenu = () => {
    setOpenFolderMenuId(null);
    document.dispatchEvent(new Event("mytests-close-folder-menu"));
  };

  const openFolder = (folderId, event, recordHistory = true) => {
    if (recordHistory && folderId !== currentFolderId) setFolderHistory((history) => [...history, currentFolderId]);
    setOpenFolderMenuId(null);
    const rect = folderPanelRef.current?.getBoundingClientRect();
    const x = rect ? Math.max(0, Math.min(rect.width, event.clientX - rect.left)) : 0;
    const y = rect ? Math.max(0, Math.min(rect.height, event.clientY - rect.top)) : 0;
    setFolderRipple({ token: Date.now() + Math.random(), x, y });

    const sound = new Audio(folderClickSound);
    sound.volume = 0.45;
    sound.play().catch(() => {});

    const targetId = folderId ?? "root";
    setZoomFolderId(targetId);
    window.clearTimeout(folderOpenTimerRef.current);
    folderOpenTimerRef.current = window.setTimeout(() => {
      setCurrentFolderId(folderId);
      setZoomFolderId(null);
    }, 240);
  };

  const goBackFolder = (event) => {
    if (!folderHistory.length) return;
    const previousFolderId = folderHistory[folderHistory.length - 1];
    setFolderHistory((history) => history.slice(0, -1));
    openFolder(previousFolderId, event, false);
  };

  useEffect(() => () => window.clearTimeout(folderOpenTimerRef.current), []);

  return (
    <div>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6 p-6 lg:p-8" style={{ background: "var(--hero-bg)" }}>
        <div className="relative z-10 flex items-center justify-between gap-6">
          <div>
            <h1 className="font-hero font-extrabold text-3xl text-white mb-1">
              My{" "}
              <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Tests
              </span>
            </h1>
            <p className="text-white/60 text-sm">Create, manage and take your tests. Track your progress and keep improving!</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="font-hand text-lg text-purple-300/70 leading-tight -rotate-2 text-right">
              Practice<br />Test<br />Improve<br />Grow
            </div>
            <img src={docIllustration} alt="" className="w-28" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📄" value={myTests.length} label="Total Tests" color="#3B82F6" />
        <StatCard icon="▶️" value={stats?.testsTaken ?? "..."} label="Tests Taken" color="#22C55E" />
        <StatCard icon="📊" value={stats ? `${stats.averageScorePercent}%` : "..."} label="Average Score" color="#A855F7" />
        <StatCard icon="🕐" value="—" label="Total Practice Time (coming soon)" color="#F59E0B" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-3 mb-6">
        <div className="flex w-full min-w-[4cm] flex-1 basis-[4cm] items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 sm:w-auto">
          <span className="text-base-content/40">🔍</span>
          <input
            type="text" placeholder="Search folders, subfolders, and tests..."
            className="min-w-0 w-full bg-transparent text-sm outline-none"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative shrink-0">
          <button type="button" className="btn btn-sm btn-outline h-full" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>⚙ Filters</button>
          {filtersOpen && <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-base-300 bg-base-100 p-4 shadow-xl">
            <label className="mb-3 block text-sm font-medium">Sort by
              <select className="select select-bordered select-sm mt-1 w-full" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="NAME">Name (A–Z)</option>
                <option value="TIME">Time (newest first)</option>
                <option value="COINS">Coins (most first)</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Visibility
              <select className="select select-bordered select-sm mt-1 w-full" value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)}>
                <option value="ALL">All tests</option>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
              </select>
            </label>
          </div>}
        </div>
        <Link to="/generate" className="btn btn-sm shrink-0 gap-1 whitespace-nowrap border-none bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          + Create New Test
        </Link>
      </div>

      <section ref={folderPanelRef} className="my-tests-folder-panel relative isolate mb-5 overflow-hidden rounded-2xl border p-4">
        {folderRipple && <div key={folderRipple.token} className="my-tests-folder-ripple" style={{ "--ripple-x": `${folderRipple.x}px`, "--ripple-y": `${folderRipple.y}px` }} aria-hidden="true" />}
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <button type="button" className="btn btn-sm btn-outline folder-back-button" disabled={!folderHistory.length} onClick={goBackFolder}>← Back</button>
              <nav aria-label="Folder navigation" className="flex flex-wrap items-center gap-2 text-sm">
                <button className={`my-tests-folder-crumb ${currentFolderId === null ? "is-current" : ""} ${zoomFolderId === "root" ? "folder-opening" : ""}`} onClick={(event) => openFolder(null, event)}>My folders</button>
                {folderPath.map((folder) => <span key={folder.id} className="flex items-center gap-2"><span className="my-tests-folder-crumb-separator">/</span><button className={`my-tests-folder-crumb ${currentFolderId === folder.id ? "is-current" : ""} ${zoomFolderId === folder.id ? "folder-opening" : ""}`} onClick={(event) => openFolder(folder.id, event)}>{folder.name}</button></span>)}
              </nav>
            </div>
            {!searching && currentFolderId !== "recent" && <button className="btn btn-sm btn-outline" onClick={() => { setFolderName(""); setFolderDialog({ type: "create" }); }}>+ {currentFolder ? "New subfolder" : "New folder"}</button>}
          </div>
          {(searching ? searchFolderResults.length > 0 : currentFolderId === null || childFolders.length > 0) && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {!searching && currentFolderId === null && <FolderCard folder={{ id: "recent", name: "Recent tests" }} isRecent opening={zoomFolderId === "recent"} onMenuVisibility={setOpenFolderMenuId} onOpen={(event) => openFolder("recent", event)} onMove={openRecentMovePicker} />}
            {(searching ? searchFolderResults : childFolders).map((folder) => <div key={folder.id}>
              {searching && <div className="mb-1 px-1 text-xs text-base-content/50">{folder.system ? "All unfiled tests" : getFolderPath(folder.parentId).join(" / ") || "My folders"}</div>}
              <FolderCard folder={folder} isRecent={folder.system} opening={zoomFolderId === folder.id} onMenuVisibility={setOpenFolderMenuId} onOpen={(event) => { if (searching) setSearch(""); openFolder(folder.id, event); }} onMove={folder.system ? openRecentMovePicker : openFolderMovePicker} onRename={openRenameFolder} onDelete={setFolderToDelete} />
            </div>)}
          </div>}
          <div className="my-tests-folder-menu-space mt-3 h-32" aria-live="polite">
            {activeFolderMenu && <div className="my-tests-folder-menu-actions flex h-full flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300/70 bg-base-100/70 px-4 py-3 shadow-inner">
              <div><p className="text-xs uppercase tracking-wider text-base-content/50">Folder options</p><p className="font-semibold">{activeFolderMenu.name}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="btn btn-sm btn-outline" onClick={() => { closeFolderMenu(); activeFolderMenu.system ? openRecentMovePicker() : openFolderMovePicker(activeFolderMenu); }}>↗ Move to</button>
                {!activeFolderMenu.system && <>
                  <button className="btn btn-sm btn-outline" onClick={() => { closeFolderMenu(); openRenameFolder(activeFolderMenu); }}>✎ Rename</button>
                  <button className="btn btn-sm btn-outline text-error" onClick={() => { closeFolderMenu(); setFolderToDelete(activeFolderMenu); }}>⌫ Delete</button>
                </>}
                {activeFolderMenu.system && <span className="text-xs text-base-content/50">System folder</span>}
              </div>
            </div>}
          </div>
          {filtered.length === 0 && (searching ? searchFolderResults.length === 0 : currentFolderId !== null && childFolders.length === 0) ? (
            <div className="card bg-base-100 shadow p-10 text-center">
              <p className="text-base-content/50">
                {myTests.length === 0 ? "No tests yet — go generate one!" : "No tests match your search/filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="my-test-card-grid mt-4 grid min-w-0 gap-5 mb-4 xl:grid-cols-2">
                {visibleTests.map((test) => (
                  <TestCard key={test.id} test={test} folderLabel={searching ? (test.folderId == null ? "Recent tests" : getFolderPath(test.folderId).join(" / ")) : null} onPublish={publishTest} onDelete={handleDelete} onMove={openMovePicker} onDownload={handleDownloadPdf} />
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mb-6">
                  <button className="btn btn-outline gap-2" onClick={() => setVisibleCount((count) => count + 4)}>
                    Show More <span className="text-xs text-base-content/40">({filtered.length - visibleCount} remaining)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

      {folderDialog && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setFolderDialog(null); }}><form onSubmit={submitFolder} className="card bg-base-100 w-full max-w-md p-5 shadow-2xl"><h2 className="font-hero text-xl font-bold mb-4">{folderDialog.type === "rename" ? "Rename folder" : currentFolder ? "Create subfolder" : "Create folder"}</h2><input autoFocus maxLength={80} className="input input-bordered w-full mb-4" placeholder="Folder name" value={folderName} onChange={(e) => setFolderName(e.target.value)} /><div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" onClick={() => setFolderDialog(null)}>Cancel</button><button className="btn btn-primary" type="submit">{folderDialog.type === "rename" ? "Save name" : "Create"}</button></div></form></div>}

      {(moveTest || moveFolder || moveRecent) && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) { setMoveTest(null); setMoveFolder(null); setMoveRecent(false); } }}>
        <section className="card bg-base-100 w-full max-w-md p-5 shadow-2xl">
          <h2 className="font-hero text-xl font-bold mb-1">{moveFolder ? "Move folder" : moveRecent ? "Move Recent tests" : "Move test"}</h2>
          <p className="text-sm text-base-content/60 mb-4 truncate">{moveFolder?.name || (moveRecent ? "Choose a destination for all unfiled tests." : moveTest?.title)}</p>
          <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            <button className="link link-primary" onClick={() => setMoveFolderViewId(null)}>My folders</button>
            {moveFolderPath.map((folder) => <span key={folder.id} className="flex items-center gap-1"><span className="opacity-40">/</span><button className="link link-primary" onClick={() => setMoveFolderViewId(folder.id)}>{folder.name}</button></span>)}
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {moveFolderViewId === null
              ? <button className="btn btn-outline w-full justify-start" onClick={() => moveFolder ? finishMoveFolder(null) : moveRecent ? moveAllRecentTests(null) : handleMove(null)}><img src={folderIcon} alt="" className="mr-2 h-5 w-5 object-contain" />{moveFolder ? "Move to My folders (top level)" : "Move to Recent tests"}</button>
              : <button className="btn btn-outline w-full justify-start" disabled={Boolean(moveFolder && isDescendantOf(moveFolderViewId, moveFolder.id))} onClick={() => moveFolder ? finishMoveFolder(moveFolderViewId) : moveRecent ? moveAllRecentTests(moveFolderViewId) : handleMove(moveFolderViewId)}><img src={folderIcon} alt="" className="mr-2 h-5 w-5 object-contain" />Move to “{moveFolderView?.name}”</button>}
            {moveFolderChildren.map((folder) => <button key={folder.id} className="btn btn-ghost w-full justify-start" onClick={() => setMoveFolderViewId(folder.id)}><img src={folderIcon} alt="" className="mr-2 h-5 w-5 object-contain" />{folder.name}<span className="ml-auto text-xs opacity-60">Open →</span></button>)}
            {moveFolderChildren.length === 0 && <p className="py-3 text-center text-sm text-base-content/50">No subfolders here.</p>}
          </div>
          <div className="mt-4 text-right"><button className="btn btn-ghost" onClick={() => { setMoveTest(null); setMoveFolder(null); setMoveRecent(false); }}>Cancel</button></div>
        </section>
      </div>}

      {folderToDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setFolderToDelete(null); }}>
        <section className="card bg-base-100 w-full max-w-md p-6 shadow-2xl">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-error/15 text-2xl text-error">!</div>
          <h2 className="font-hero text-xl font-bold">Delete “{folderToDelete.name}”?</h2>
          <p className="mt-2 text-sm text-base-content/65">This also deletes its subfolders. Tests inside them will be kept in Recent tests. This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setFolderToDelete(null)}>Cancel</button><button className="btn btn-error" onClick={confirmDeleteFolder}>Delete folder</button></div>
        </section>
      </div>}

      {/* Bottom banner */}
      <div className="relative rounded-2xl overflow-hidden p-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ background: "var(--hero-bg)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="font-hero font-semibold text-white">Consistency leads to success!</h3>
            <p className="text-xs text-white/50">Take more tests, track your progress and become a better version of you.</p>
          </div>
        </div>
        <p className="font-hand text-lg text-white/40 italic">"Discipline today, success tomorrow."</p>
      </div>
    </div>
  );
}
