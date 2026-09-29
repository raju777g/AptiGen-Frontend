import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTestStore } from "../store/testStore";
import { useWalletStore } from "../store/walletStore";
import { useAuthStore } from "../store/authStore";
import { clearActiveTestDraft, getActiveTestDraftKey, readActiveTestDraft, saveActiveTestDraft } from "../utils/activeTestDraft";
import deepFocusMusic from "../assets/bg-music/alex-morgan-focus-music-601104.mp3";
import studyMotivationMusic from "../assets/bg-music/leberch-motivation-motivation-music-580531.mp3";
import rainFocusMusic from "../assets/bg-music/milagrosgomez-dark-atmosphere-with-rain-352570.mp3";
import forestFocusMusic from "../assets/bg-music/the_mountain-forest-163871.mp3";
import mountainCalmMusic from "../assets/bg-music/velariomusic-peaceful-582874.mp3";
import celticForestMusic from "../assets/bg-music/vjgalaxy-mystical-celtic-forest-ambience-05-560012.mp3";

const focusTracks = [
  { name: "Rain Focus", mood: "Soft rain ambience", src: rainFocusMusic },
  { name: "Forest Retreat", mood: "A quiet forest soundscape", src: forestFocusMusic },
  { name: "Mountain Calm", mood: "Peaceful nature tones", src: mountainCalmMusic },
  { name: "Deep Focus", mood: "Instrumental concentration music", src: deepFocusMusic },
  { name: "Study Motivation", mood: "Steady study soundtrack", src: studyMotivationMusic },
  { name: "Celtic Forest", mood: "Mystical woodland ambience", src: celticForestMusic },
];

function FocusMusicPlayer() {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const track = focusTracks[trackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.src = focusTracks[trackIndex].src;
    audio.volume = volume;
    return () => { audio.pause(); audio.removeAttribute("src"); audio.load(); };
  }, []);

  const changeTrack = (nextIndex) => {
    const audio = audioRef.current;
    if (!audio) return;
    const resumePlayback = !audio.paused;
    audio.pause();
    audio.src = focusTracks[nextIndex].src;
    audio.load();
    setTrackIndex(nextIndex);
    if (resumePlayback) audio.play().catch(() => setPlaying(false));
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  };

  const changeVolume = (event) => {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    if (audioRef.current) audioRef.current.volume = nextVolume;
  };

  return <section className="mt-5 rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-3.5">
    <audio ref={audioRef} loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <div className="flex items-center justify-between gap-2"><div><h3 className="font-hero text-sm font-bold">Focus music</h3><p className="mt-0.5 text-[11px] text-base-content/55">Choose a soundscape for your session</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-lg" aria-hidden="true">♫</span></div>
    <label className="mt-3 block text-xs text-base-content/60">Now playing
      <select className="select select-bordered mt-1 h-10 min-h-0 w-full text-sm" value={trackIndex} onChange={(event) => changeTrack(Number(event.target.value))} aria-label="Choose focus music">
        {focusTracks.map((item, index) => <option key={item.name} value={index}>{item.name}</option>)}
      </select>
    </label>
    <p className="mt-2 truncate text-xs text-base-content/55">{track.mood}</p>
    <div className="mt-3 flex items-center justify-center gap-3">
      <button type="button" onClick={() => changeTrack((trackIndex + focusTracks.length - 1) % focusTracks.length)} aria-label="Previous focus music" className="btn btn-sm btn-ghost">⏮</button>
      <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause focus music" : "Play focus music"} className="btn btn-sm border-0 bg-gradient-to-r from-indigo-500 to-violet-600 px-5 text-white">{playing ? "Pause" : "Play"}</button>
      <button type="button" onClick={() => changeTrack((trackIndex + 1) % focusTracks.length)} aria-label="Next focus music" className="btn btn-sm btn-ghost">⏭</button>
    </div>
    <label className="mt-3 flex items-center gap-2 text-xs text-base-content/55">Volume<input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} className="range range-xs range-primary" /></label>
  </section>;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function getQuestionStatus(index, currentIndex, answers, marked, visited, questionId) {
  if (index === currentIndex) return "current";
  if (marked[questionId]) return "marked";
  if (answers[questionId]) return "answered";
  if (visited[index]) return "visited";
  return "unvisited";
}

const statusStyles = {
  current: "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20",
  answered: "border-emerald-400 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
  marked: "border-amber-400 bg-amber-400/20 text-amber-800 dark:text-amber-200",
  visited: "border-slate-300 bg-base-200 text-base-content/70",
  unvisited: "border-base-300 bg-base-100 text-base-content/55 hover:border-violet-300",
};

export default function TakeTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeAttempt, startAttempt, submitAttempt } = useTestStore();
  const fetchWallet = useWalletStore((s) => s.fetchWallet);
  const user = useAuthStore((s) => s.user);
  const storageKey = getActiveTestDraftKey(user);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [securityWarning, setSecurityWarning] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [needsFullscreenStart, setNeedsFullscreenStart] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(false);
  const [blockingDraftId, setBlockingDraftId] = useState(null);
  const submittedRef = useRef(false);
  const submittingRef = useRef(false);
  const autoSubmittedRef = useRef(false);
  const answersRef = useRef(answers);
  const deadlineRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const hasStartedRef = useRef(false);
  answersRef.current = answers;

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    const savedDraft = readActiveTestDraft(user);
    if (savedDraft && Number(savedDraft.testId) !== Number(id)) {
      setBlockingDraftId(savedDraft.testId);
      setLoading(false);
      return;
    }
    if (savedDraft?.activeAttempt?.questions?.length && savedDraft.deadlineAt) {
      useTestStore.setState({ activeAttempt: savedDraft.activeAttempt });
      setCurrentIndex(Math.min(savedDraft.currentIndex || 0, savedDraft.activeAttempt.questions.length - 1));
      setAnswers(savedDraft.answers || {});
      setMarked(savedDraft.marked || {});
      setVisited(savedDraft.visited || { 0: true });
      setTabSwitches(savedDraft.tabSwitches || 0);
      setSecurityWarning((savedDraft.tabSwitches || 0) > 0);
      tabSwitchCountRef.current = savedDraft.tabSwitches || 0;
      deadlineRef.current = savedDraft.deadlineAt;
      setTimeLeft(Math.max(0, Math.ceil((savedDraft.deadlineAt - Date.now()) / 1000)));
      setDraftReady(true);
      setNeedsFullscreenStart(true);
      setResumeDraft(true);
      setLoading(false);
      return;
    }
    setNeedsFullscreenStart(true);
    setLoading(false);
  }, [id, startAttempt, storageKey]);

  const questions = activeAttempt?.questions || [];
  const question = questions[currentIndex];
  const totalQuestions = questions.length;
  const unansweredCount = questions.filter((q) => !answers[q.questionId]).length;
  const markedCount = questions.filter((q) => marked[q.questionId]).length;
  const unvisitedCount = questions.filter((_, index) => !visited[index]).length;

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      const data = await submitAttempt(answersRef.current);
      submittedRef.current = true;
      clearActiveTestDraft(user);
      fetchWallet();
      navigate("/results", { state: data });
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your test. Please try again.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [fetchWallet, navigate, submitAttempt, user]);

  useEffect(() => {
    if (!activeAttempt || timeLeft === null || !deadlineRef.current || submittedRef.current || isSubmitting) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft((previous) => previous === remaining ? previous : remaining);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") updateCountdown();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activeAttempt, timeLeft === null, handleSubmit, isSubmitting]);

  useEffect(() => {
    if (!draftReady || !activeAttempt || !deadlineRef.current || submittedRef.current) return;
    saveActiveTestDraft(user, {
      testId: Number(id),
      activeAttempt,
      currentIndex,
      answers,
      marked,
      visited,
      tabSwitches,
      deadlineAt: deadlineRef.current,
    });
  }, [draftReady, activeAttempt, id, currentIndex, answers, marked, visited, tabSwitches, timeLeft, user]);

  useEffect(() => {
    if (!activeAttempt || submittedRef.current) return;
    const onTabVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const nextCount = tabSwitchCountRef.current + 1;
      tabSwitchCountRef.current = nextCount;
      setTabSwitches(nextCount);
      setSecurityWarning(true);
      if (nextCount >= 3) handleSubmit();
    };
    document.addEventListener("visibilitychange", onTabVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onTabVisibilityChange);
  }, [activeAttempt, handleSubmit]);

  /* Keep the per-second display aligned to the deadline, even after backgrounding. */
  useEffect(() => {
    if (timeLeft === 0 && activeAttempt && !submittedRef.current && !isSubmitting) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        handleSubmit();
      }
    }
  }, [activeAttempt, timeLeft, handleSubmit, isSubmitting]);

  useEffect(() => {
    if (currentIndex < totalQuestions) setVisited((prev) => ({ ...prev, [currentIndex]: true }));
  }, [currentIndex, totalQuestions]);

  const selectAnswer = (option) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.questionId]: option }));
  };

  const jumpTo = (index) => {
    if (index >= 0 && index < totalQuestions) setCurrentIndex(index);
  };

  const handleStartTest = async () => {
    setError("");
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setError("Fullscreen could not be enabled. Your browser may have blocked it; you can still continue.");
    }

    if (resumeDraft) {
      setNeedsFullscreenStart(false);
      return;
    }

    setLoading(true);
    try {
      const data = await startAttempt(Number(id));
      const duration = data.secondsPerQuestion * data.questions.length;
      deadlineRef.current = Date.now() + duration * 1000;
      setTimeLeft(duration);
      setVisited({ 0: true });
      setDraftReady(true);
      setNeedsFullscreenStart(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not start this test");
      setLoading(false);
    }
  };

  useEffect(() => () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  if (loading) return <div className="mx-auto mt-16 max-w-md text-center"><span className="loading loading-spinner loading-lg text-primary" /><p className="mt-3 text-sm text-base-content/60">Preparing your exam…</p></div>;
  if (blockingDraftId) return <div role="alert" className="mx-auto mt-10 max-w-md rounded-2xl border border-amber-400/40 bg-amber-400/10 p-6 text-center"><h2 className="font-hero text-lg font-bold">Another test is in progress</h2><p className="mt-2 text-sm text-base-content/65">Resume or submit that test before starting a different one.</p><Link to={`/take-test/${blockingDraftId}`} className="btn btn-primary mt-4">Resume current test</Link></div>;
  if (needsFullscreenStart) return <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-violet-400/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-7 text-center text-white shadow-2xl sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/20 text-3xl text-violet-200 ring-1 ring-violet-300/30">✦</div><p className="mt-5 text-xs font-semibold uppercase tracking-[.25em] text-cyan-200">AptiGen secure exam</p><h1 className="mt-2 text-3xl font-extrabold">{resumeDraft ? "Ready to resume?" : "Ready to begin?"}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-300">The test will open in fullscreen. Your answers and timer are saved as you go. You can move between questions and submit when you are done.</p>{error && <p role="alert" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{error}</p>}<div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={handleStartTest} className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3 font-bold text-white shadow-lg shadow-violet-900/40 transition hover:-translate-y-0.5 hover:brightness-110">{resumeDraft ? "Resume test" : "Start test"} →</button><Link to="/my-tests" className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/5">Back to my tests</Link></div><p className="mt-5 text-xs text-slate-500">Use the browser’s fullscreen control to exit. The test timer continues while you are away.</p></div>;
  if (error && !activeAttempt) return <div role="alert" className="alert alert-error mx-auto mt-10 max-w-md">{error}</div>;
  if (!question) return null;

  const currentQuestionId = question.questionId;
  const isMarked = Boolean(marked[currentQuestionId]);
  const progress = totalQuestions ? ((Object.keys(visited).length) / totalQuestions) * 100 : 0;

  return <div className="mx-auto max-w-6xl px-1 py-4 sm:px-4 lg:py-8">
    <header className="mb-5 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Exam in progress</p><h1 className="mt-1 font-hero text-xl font-bold text-base-content sm:text-2xl">Question {currentIndex + 1} <span className="text-base-content/40">/ {totalQuestions}</span></h1></div>
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xl font-bold tabular-nums ${timeLeft <= 60 ? "border-rose-400/50 bg-rose-500/10 text-rose-600 animate-pulse" : "border-primary/20 bg-primary/5 text-primary"}`} aria-live="polite"><span>◷</span>{formatTime(timeLeft)}</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-200"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <p className="mt-2 text-xs text-base-content/50">One shared clock for all {totalQuestions} questions ({activeAttempt.secondsPerQuestion}s each). Move freely between questions.</p>
    </header>

    {error && <div role="alert" className="alert alert-error mb-4 text-sm">{error}</div>}
    {securityWarning && <div role="status" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"><span>⚠ Tab switch detected ({tabSwitches}/3). {tabSwitches >= 3 ? "Your test is being submitted." : `${3 - tabSwitches} more switch${3 - tabSwitches === 1 ? "" : "es"} will submit the test automatically.`}</span><button type="button" onClick={() => setSecurityWarning(false)} className="rounded px-2 py-1 hover:bg-amber-400/20">Dismiss</button></div>}

    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
      <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Question {String(currentIndex + 1).padStart(2, "0")}</span><button type="button" onClick={() => setMarked((prev) => ({ ...prev, [currentQuestionId]: !prev[currentQuestionId] }))} className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${isMarked ? "border-amber-400 bg-amber-400/15 text-amber-800 dark:text-amber-200" : "border-base-300 text-base-content/60 hover:border-amber-300 hover:text-amber-700"}`}>{isMarked ? "⚑ Marked for review" : "⚐ Mark for review"}</button></div>
        <h2 className="text-lg font-semibold leading-relaxed text-base-content sm:text-xl">{question.questionText}</h2>
        <div className="mt-6 grid gap-3">{["A", "B", "C", "D"].map((option) => {
          const optionText = question[`option${option}`];
          if (!optionText) return null;
          const selected = answers[currentQuestionId] === option;
          return <button key={option} type="button" onClick={() => selectAnswer(option)} aria-pressed={selected} className={`group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-base-300 bg-base-100 hover:border-primary/40"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition ${selected ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/70 group-hover:bg-primary/10 group-hover:text-primary"}`}>{option}</span><span className="pt-1 text-sm leading-relaxed text-base-content">{optionText}</span><span className="ml-auto pt-1 text-primary">{selected ? "✓" : ""}</span></button>;
        })}</div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-base-200 pt-5"><button type="button" onClick={() => jumpTo(currentIndex - 1)} disabled={currentIndex === 0} className="btn btn-outline">← Previous</button><p className="order-last w-full text-center text-xs text-base-content/50 sm:order-none sm:w-auto">{answers[currentQuestionId] ? "Answer saved" : "No answer selected"} · Auto-saved</p><div className="flex gap-2"><button type="button" onClick={() => jumpTo(currentIndex + 1)} disabled={currentIndex === totalQuestions - 1} className="btn btn-primary">Save & Next →</button><button type="button" onClick={() => setConfirmSubmit(true)} className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">Submit test</button></div></div>
      </section>

      <aside className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><div><h2 className="font-hero font-bold">Question navigator</h2><p className="mt-1 text-xs text-base-content/50">Jump to any question</p></div><span className="badge badge-ghost">{totalQuestions} total</span></div>
        <div className="mt-4 grid grid-cols-5 gap-2">{questions.map((item, index) => {
          const status = getQuestionStatus(index, currentIndex, answers, marked, visited, item.questionId);
          return <button key={item.questionId} type="button" onClick={() => jumpTo(index)} aria-label={`Go to question ${index + 1}, ${status}`} aria-current={index === currentIndex ? "step" : undefined} className={`relative aspect-square rounded-xl border text-sm font-bold transition hover:-translate-y-0.5 hover:shadow ${statusStyles[status]}`}>
            {index + 1}{marked[item.questionId] && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] text-amber-950">⚑</span>}
          </button>;
        })}</div>
        <div className="mt-5 grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-base-content/65"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-violet-500"/>Current</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500"/>Answered</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400"/>Marked</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-slate-300"/>Visited</span><span className="col-span-2"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm border border-base-300"/>Not visited</span></div>
        <div className="mt-5 space-y-2 rounded-xl bg-base-200/70 p-3 text-xs"><div className="flex justify-between"><span>Answered</span><b>{totalQuestions - unansweredCount}/{totalQuestions}</b></div><div className="flex justify-between"><span>Marked for review</span><b>{markedCount}</b></div><div className="flex justify-between"><span>Not visited</span><b>{unvisitedCount}</b></div></div>
        <FocusMusicPlayer />
      </aside>
    </div>

    {confirmSubmit && <div className="modal modal-open" onClick={(event) => event.target === event.currentTarget && !isSubmitting && setConfirmSubmit(false)}><div className="modal-box rounded-2xl"><h3 className="font-hero text-xl font-bold">Submit your test?</h3><p className="mt-2 text-sm text-base-content/60">Review your progress before finishing. You can go back to any question.</p><div className="my-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-emerald-500/10 p-3"><b className="block text-lg text-emerald-600">{totalQuestions - unansweredCount}</b><span className="text-xs">answered</span></div><div className="rounded-xl bg-amber-400/15 p-3"><b className="block text-lg text-amber-700">{markedCount}</b><span className="text-xs">marked</span></div><div className="rounded-xl bg-base-200 p-3"><b className="block text-lg">{unvisitedCount}</b><span className="text-xs">not visited</span></div></div>{(unansweredCount > 0 || markedCount > 0 || unvisitedCount > 0) && <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-800 dark:text-amber-200">Reminder: {unansweredCount > 0 && `${unansweredCount} unanswered`}{unansweredCount > 0 && markedCount > 0 && ", "}{markedCount > 0 && `${markedCount} marked for review`}{(unansweredCount > 0 || markedCount > 0) && unvisitedCount > 0 && ", "}{unvisitedCount > 0 && `${unvisitedCount} not visited`}.</p>}<div className="modal-action"><button type="button" disabled={isSubmitting} onClick={() => setConfirmSubmit(false)} className="btn btn-ghost">Review answers</button><button type="button" disabled={isSubmitting} onClick={handleSubmit} className="btn btn-primary">{isSubmitting ? "Submitting…" : "Submit now"}</button></div></div></div>}
  </div>;
}
