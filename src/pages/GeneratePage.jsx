import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTestStore } from "../store/testStore";
import { useWalletStore } from "../store/walletStore";
import { useThemeStore } from "../store/themeStore";
import cloudUploadIcon from "../assets/icon-cloud-upload.png";
import imageFilesIcon from "../assets/image-files.png";
import cameraIcon from "../assets/camera.png";
import GenerationOverlay from "../components/GenerationOverlay";

const TIME_PRESETS = [30, 60, 120, 180, 300];
const MAX_IMAGE_SIZE_BYTES = 500 * 1024 * 1024;

export default function GeneratePage() {
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme !== "dark";
  const [pages, setPages] = useState([]);
  const [uploadsLoaded, setUploadsLoaded] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [seconds, setSeconds] = useState(120);

  const [inputMode, setInputMode] = useState("HANDWRITTEN_OR_OTHER_LANGUAGE");
  const [questionCount, setQuestionCount] = useState(10);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const cameraVideoRef = useRef(null);

  const { generateTest, isGenerating, error } = useTestStore();
  const [createdTest, setCreatedTest] = useState(null);
  const fetchWallet = useWalletStore((s) => s.fetchWallet);

  const addFiles = (fileList) => {
    const selectedFiles = Array.from(fileList);
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE_BYTES);
    setUploadError(oversizedFiles.length ? `${oversizedFiles.map((file) => file.name).join(", ")} exceed the 500 MB per-image limit.` : "");
    const newPages = imageFiles.map((file) => ({ id: `${Date.now()}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) }));
    setPages((prev) => [...prev, ...newPages].slice(0, 10));
  };

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open("aptigen-generate-images", 1);
          request.onupgradeneeded = () => request.result.createObjectStore("images", { keyPath: "id" });
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const rows = await new Promise((resolve, reject) => { const req = db.transaction("images").objectStore("images").getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        if (!cancelled && rows.length) setPages(rows.map(({ id, file }) => ({ id, file, previewUrl: URL.createObjectURL(file) })));
        db.close();
      } catch { /* Browser storage may be unavailable; uploads still work in this session. */ }
      finally { if (!cancelled) setUploadsLoaded(true); }
    };
    restore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!uploadsLoaded) return;
    const persist = async () => {
      try {
        const db = await new Promise((resolve, reject) => { const req = indexedDB.open("aptigen-generate-images", 1); req.onupgradeneeded = () => req.result.createObjectStore("images", { keyPath: "id" }); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        const tx = db.transaction("images", "readwrite"); const store = tx.objectStore("images"); store.clear(); pages.forEach(({ id, file }) => store.put({ id, file }));
        localStorage.setItem("aptigen.generate.uploads", JSON.stringify(pages.map(({ id, file }) => ({ id, name: file.name, type: file.type, size: file.size }))));
        tx.oncomplete = () => db.close();
      } catch { /* Keep the current upload state even if persistence is full. */ }
    };
    persist();
  }, [pages, uploadsLoaded]);

  const openImagePicker = () => fileInputRef.current?.click();

  const handleCaptureOption = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      setCameraReady(false);
      setCameraStream(stream);
    } catch {
      cameraInputRef.current?.click();
    }
  };

  const closeCamera = () => { setCameraReady(false); setCameraStream(null); };

  useEffect(() => {
    if (!cameraStream) return undefined;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = cameraStream;
    return () => cameraStream.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  useEffect(() => {
    if (!imagePreview) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setImagePreview(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [imagePreview]);

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    if (!video?.videoWidth || !video?.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const photo = new File([blob], `aptigen-${Date.now()}.jpg`, { type: "image/jpeg" });
      addFiles([photo]);
      closeCamera();
    }, "image/jpeg", 0.92);
  };

  const removePage = (index) => setPages((prev) => { const removed = prev[index]; if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl); return prev.filter((_, i) => i !== index); });
  const openImagePreview = (page, index) => {
    setPreviewZoom(1);
    setImagePreview({ page, index });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pages.length === 0) return;
    try {
      setCreatedTest(null);
      const result = await generateTest({
        images: pages.map((p) => p.file),
        title, timerMode: "STANDARD", secondsPerQuestion: seconds,
        mode: inputMode, questionCount,
      });
      setCreatedTest(result);
      fetchWallet();
      setPages([]);
      setTitle("");
    } catch {
      // error already in the store
    }
  };

  return (
    <div data-theme={theme} className={`generate-page relative -m-4 lg:-m-6 p-4 lg:p-6 overflow-hidden ${isLight ? "generate-page-light" : ""}`} style={{ background: isLight ? "linear-gradient(145deg, #eff6ff 0%, #f5f3ff 58%, #eefaff 100%)" : "var(--hero-bg)" }}>
      {/* Floating handwritten annotations — desktop only */}
      <div className="generate-note hidden lg:block absolute left-8 top-24 font-hand text-xl text-white/50 leading-tight -rotate-2">
        Your Notes<br />Our AI<br />Better Tests
      </div>
      <div className="generate-note hidden lg:block absolute right-8 top-16 font-hand text-xl text-purple-300/60 leading-tight rotate-2 text-right">
        Study<br />Practice<br />Improve<br />Grow
      </div>
      <div className="generate-note hidden lg:block absolute left-10 bottom-20 font-hand text-lg text-white/40 leading-tight -rotate-3">
        "Small Steps<br />Big Results"
      </div>

      {/* Floating decorative doc icons — desktop only, purely ambient */}
      <div className="hidden lg:block absolute left-4 top-1/2 text-4xl opacity-20 -rotate-12 pointer-events-none">📄</div>
      <div className="hidden lg:block absolute right-6 bottom-1/3 text-4xl opacity-20 rotate-12 pointer-events-none">📄</div>


      <div className="max-w-4xl mx-auto relative z-10 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="generate-heading generate-title font-hero font-extrabold text-3xl lg:text-4xl mb-2 text-white">
            Generate a{" "}
            <span style={{ background: "var(--hero-gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Mock Test
            </span>{" "}
            <span className="generate-sparkle inline-block">✨</span>
          </h1>
          <p className="generate-subtitle text-white/60">Turn your study material into a personalized mock test in seconds.</p>
          <p className="generate-caption text-white/40 text-sm">Upload notes or MCQs. AptiGen will recognize the material and prepare your test.</p>
        </div>

        <div className="generate-mode-tab mb-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-base-100/80 p-4 shadow-lg">
          <span className="text-2xl">🧠</span>
          <div><h2 className="font-semibold">From notes or MCQs</h2><p className="text-xs text-base-content/60">AptiGen Vision detects the content type and preserves the original language.</p></div>
        </div>

        <div className="generate-mode-tab mb-6 rounded-xl border border-primary/30 bg-base-100/80 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <div><h2 className="font-semibold">Choose your source type</h2><p className="text-xs text-base-content/60">This selects the extraction service used for your uploaded pages.</p></div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Extraction source type">
            <button type="button" role="radio" aria-checked={inputMode === "HANDWRITTEN_OR_OTHER_LANGUAGE"} onClick={() => setInputMode("HANDWRITTEN_OR_OTHER_LANGUAGE")} className={`rounded-xl border p-3 text-left transition ${inputMode === "HANDWRITTEN_OR_OTHER_LANGUAGE" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-base-300 hover:border-primary/50"}`}>
              <span className="block font-semibold">✍️ Handwritten / other language</span>
              <span className="mt-1 block text-xs text-base-content/60">Gemini reads the original images directly.</span>
            </button>
            <button type="button" role="radio" aria-checked={inputMode === "ENGLISH_PRINTED"} onClick={() => setInputMode("ENGLISH_PRINTED")} className={`rounded-xl border p-3 text-left transition ${inputMode === "ENGLISH_PRINTED" ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-base-300 hover:border-primary/50"}`}>
              <span className="block font-semibold">🖨️ English printed text</span>
              <span className="mt-1 block text-xs text-base-content/60">OCR extracts text, then Groq extracts questions.</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="generate-card card bg-base-100 shadow-xl p-6 lg:p-8">
          {/* Visual step indicator — decorative only, this stays a single-page form */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { num: 1, title: "Details", desc: "Set up your test", active: true },
              { num: 2, title: "Upload", desc: "Add your study material", active: pages.length > 0 },
              { num: 3, title: "Configure", desc: "Customize settings", active: pages.length > 0 && title.trim().length > 0 },
            ].map((step, i) => (
              <div key={step.num} className={`generate-step flex items-center gap-2 flex-1 min-w-fit ${step.active ? "is-active" : ""}`}>
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${step.active ? "bg-primary/10 border border-primary/30" : ""}`}>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.active ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/50"
                      }`}
                  >
                    {step.num}
                  </span>
                  <div className="whitespace-nowrap">
                    <div className="text-sm font-semibold">{step.title}</div>
                    <div className="text-xs text-base-content/40">{step.desc}</div>
                  </div>
                </div>
                {i < 2 && <div className="flex-1 h-px bg-base-300 min-w-6" />}
              </div>
            ))}
          </div>

          {/* Test Title */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 font-semibold text-sm">📄 Test Title</label>
              <span className="text-xs text-base-content/40">{title.length}/100</span>
            </div>
            <input
              type="text" placeholder="Test title (e.g. Chapter 3 Quant)" required maxLength={100}
              className="input input-bordered w-full"
              value={title} onChange={(e) => setTitle(e.target.value)}
            />
          </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 font-semibold text-sm mb-2">🔢 Number of Questions</label>
              <input
                type="number" min="1" max="30" required
                className="input input-bordered w-full"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
              <p className="text-xs text-base-content/50 mt-1">Used when you upload notes. Existing MCQs are extracted as shown. Maximum 30.</p>
            </div>

          {/* Upload zone */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 font-semibold text-sm">⬆️ Upload notes or MCQ pages</label>
              <span className="text-xs text-base-content/40">Multiple pages supported</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`generate-dropzone rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center text-center p-6 sm:p-10 ${isDragging ? "is-dragging border-primary bg-primary/5" : "border-base-300"
                }`}
            >
              <input
                ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
              <input
                ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
              <img src={cloudUploadIcon} alt="" className="w-16 h-16 mb-3" />
              <p className="font-semibold mb-1">
                Drop your notes or MCQ pages here
              </p>
              <p className="text-sm text-base-content/50 mb-4">Choose how you want to add an image</p>
              <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              <button type="button" onClick={openImagePicker} className="generate-browse btn text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500">
                <img src={imageFilesIcon} alt="" className="h-5 w-5 object-contain" /> Upload from device
              </button>
              <button type="button" onClick={handleCaptureOption} className="btn btn-outline gap-2"><img src={cameraIcon} alt="" className="h-5 w-5 object-contain" /> Capture one</button>
              </div>
              <p className="text-xs text-base-content/40 mt-4">Images up to 500 MB each · JPG, PNG &nbsp;|&nbsp; Up to 10 pages supported</p>
            </div>

            {uploadError && <div role="alert" className="alert alert-error mt-3 text-sm">{uploadError}</div>}

            {pages.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {pages.map((page, i) => (
                  <div key={page.id || i} className="generate-file-preview relative h-20 w-20 shrink-0 group">
                    <button type="button" onClick={() => openImagePreview(page, i)} className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" aria-label={`Preview page ${i + 1} at full size`}>
                      <img src={page.previewUrl} alt={`Page ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-base-300" />
                    </button>
                    <span className="absolute -top-2 -left-2 bg-primary text-primary-content text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <button
                      type="button" onClick={() => removePage(i)}
                      className="absolute right-1 top-1 z-20 bg-error text-error-content text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-100 transition-opacity"
                      aria-label={`Remove page ${i + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Per-question allowance; the exam uses one shared total timer. */}
          <div className="mb-6">
            <label className="flex items-center gap-2 font-semibold text-sm mb-2">🕐 Time Per Question</label>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button" onClick={() => setSeconds((s) => Math.max(10, s - 10))}
                className="btn btn-circle btn-sm btn-outline"
              >
                −
              </button>
              <div className="flex-1 text-center font-hero font-bold text-2xl">
                {seconds} <span className="text-sm font-normal text-base-content/50">seconds per question</span>
              </div>
              <button
                type="button" onClick={() => setSeconds((s) => s + 10)}
                className="btn btn-circle btn-sm btn-outline"
              >
                +
              </button>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {TIME_PRESETS.map((p) => (
                <button
                  key={p} type="button" onClick={() => setSeconds(p)}
                  className={`generate-time-preset btn btn-sm ${seconds === p ? "btn-primary is-selected" : "btn-outline"}`}
                >
                  {p}s
                </button>
              ))}
            </div>
          </div>

          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-base-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <div>
                <div className="text-sm font-medium">Question Count</div>
                <div className="text-xs text-base-content/50">
                  {pages.length > 0 ? `${pages.length} page${pages.length !== 1 ? "s" : ""} uploaded — count detected after processing` : "Upload pages to begin"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <div>
                <div className="text-sm font-medium">Total Cost</div>
                <div className="text-xs text-base-content/50">
                  1 coins per generated question
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || pages.length === 0}
            className="generate-submit btn btn-lg w-full text-white border-none bg-gradient-to-r from-indigo-500 to-purple-500 gap-2"
          >
            {isGenerating ? "Generating..." : <>⚡ Generate Mock Test →</>}
          </button>
          <p className="text-center text-xs text-base-content/40 mt-3">🪙 Cost is based on the content AptiGen identifies.</p>

          {error && <div className="alert alert-error text-sm mt-4">{error}</div>}
        </form>

        {cameraStream && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCamera(); }}>
            <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-violet-400/40 bg-slate-900 text-white shadow-2xl shadow-violet-950/50" role="dialog" aria-modal="true" aria-label="Take a study page photo">
              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <div><h2 className="font-hero font-bold">Take a photo</h2><p className="text-xs text-slate-300">Keep the whole page in frame</p></div>
                <button type="button" className="btn btn-circle btn-sm btn-ghost text-xl text-white" onClick={closeCamera} aria-label="Close camera">×</button>
              </div>
              <div className="relative bg-black">
                <video ref={cameraVideoRef} autoPlay playsInline muted onCanPlay={() => setCameraReady(true)} className="max-h-[65vh] min-h-64 w-full object-contain" />
                <div className="pointer-events-none absolute inset-[8%] rounded-xl border border-white/50" />
              </div>
              <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
                <button type="button" className="btn btn-ghost text-white" onClick={() => { closeCamera(); openImagePicker(); }}>Choose from photos</button>
                <button type="button" disabled={!cameraReady} className="btn border-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 text-white" onClick={capturePhoto}>● &nbsp; Capture</button>
              </div>
            </section>
          </div>
        )}

        <GenerationOverlay active={isGenerating} />
      </div>

      {createdTest && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreatedTest(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="created-test-title" className="generated-test-modal w-full max-w-md overflow-hidden rounded-3xl border border-violet-300/30 bg-base-100 shadow-2xl shadow-violet-950/40">
          <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-6 text-center text-white">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-3xl">✨</div>
            <h2 id="created-test-title" className="font-hero text-2xl font-extrabold">Your test is ready!</h2>
            <p className="mt-1 text-sm text-white/80">{createdTest.title}</p>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-center text-sm text-base-content/65">Your generated test has been saved. Start taking it now?</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn border-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white" onClick={() => navigate(`/take-test/${createdTest.id}`)}>Take test now →</button>
              <button type="button" className="btn btn-outline" onClick={() => setCreatedTest(null)}>Dismiss</button>
            </div>
          </div>
        </section>
      </div>}
      {imagePreview && createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-3 backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setImagePreview(null); }}>
        <section role="dialog" aria-modal="true" aria-label={`Image preview, page ${imagePreview.index + 1}`} className="w-full max-w-5xl overflow-hidden rounded-2xl border border-violet-300/25 bg-slate-900 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0"><h2 className="font-semibold">Image preview</h2><p className="truncate text-xs text-slate-400">{imagePreview.page.file.name}</p></div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setPreviewZoom((zoom) => Math.max(1, zoom - .25))} aria-label="Zoom out" disabled={previewZoom <= 1}>−</button>
              <button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setPreviewZoom(1)}>{Math.round(previewZoom * 100)}%</button>
              <button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setPreviewZoom((zoom) => Math.min(4, zoom + .25))} aria-label="Zoom in" disabled={previewZoom >= 4}>+</button>
              <button type="button" className="btn btn-circle btn-sm btn-ghost text-xl text-white" onClick={() => setImagePreview(null)} aria-label="Close image preview">×</button>
            </div>
          </div>
          <div className="generate-image-preview-stage max-h-[78vh] overflow-auto p-3 sm:p-5" onWheel={(event) => { if (!event.ctrlKey) return; event.preventDefault(); setPreviewZoom((zoom) => Math.min(4, Math.max(1, zoom + (event.deltaY < 0 ? .15 : -.15)))); }}>
            <img src={imagePreview.page.previewUrl} alt={`Full preview of page ${imagePreview.index + 1}`} style={previewZoom === 1 ? { maxWidth: "100%", maxHeight: "72vh", width: "auto" } : { width: `${previewZoom * 100}%`, maxWidth: "none", maxHeight: "none" }} className="mx-auto block rounded-lg object-contain transition-[width] duration-150" />
          </div>
        </section>
      </div>, document.body)}
    </div>
  );
}
