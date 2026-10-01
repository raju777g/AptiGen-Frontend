import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import AdminWorkspaceLayout from "../components/AdminWorkspaceLayout";
import { compressImageIfNeeded } from "../utils/compressImage";

export default function AdminGeneratePage() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(10);
  const [seconds, setSeconds] = useState(120);
  const [timerMode, setTimerMode] = useState("CUSTOM");
  const [mode, setMode] = useState("AUTO");
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const addFiles = (selected) => setFiles((current) => [...current, ...selected.filter((file) => file.type.startsWith("image/")).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  const closeCamera = () => { cameraStream?.getTracks().forEach((track) => track.stop()); setCameraStream(null); setCameraOpen(false); };
  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return setError("Live camera capture is not supported by this browser.");
    try { setError(""); setCameraStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })); setCameraOpen(true); }
    catch (err) { setError(err.name === "NotAllowedError" ? "Camera permission was denied." : "Could not open the device camera."); }
  };
  const captureCameraImage = () => {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => { if (blob) { addFiles([new File([blob], `aptigen-capture-${Date.now()}.jpg`, { type: "image/jpeg" })]); closeCamera(); } }, "image/jpeg", .92);
  };
  useEffect(() => { if (cameraStream && videoRef.current) { videoRef.current.srcObject = cameraStream; videoRef.current.play().catch(() => {}); } }, [cameraStream]);
  useEffect(() => () => cameraStream?.getTracks().forEach((track) => track.stop()), [cameraStream]);
  const submit = async (event) => {
    event.preventDefault();
    if (!files.length || !title.trim()) return setError("Add a title and at least one image.");
    setBusy(true); setError(""); setNotice("");
    try {
      const form = new FormData();
      for (const file of await Promise.all(files.map((item) => compressImageIfNeeded(item.file)))) form.append("images", file);
      form.append("title", title.trim()); form.append("timerMode", timerMode); form.append("secondsPerQuestion", String(seconds)); form.append("mode", mode); form.append("questionCount", String(count));
      await api.post("/generate", form, { headers: { "Content-Type": "multipart/form-data" } });
      setTitle(""); setFiles([]); setNotice("Test generated. Open My Tests to organize or publish it.");
    } catch (err) { setError(err.response?.data?.message || "Could not generate the test."); }
    finally { setBusy(false); }
  };

  return <AdminWorkspaceLayout title="Generate Test"><section className="max-w-4xl rounded-3xl border border-violet-400/25 bg-gradient-to-br from-[#12183b] to-[#17112f] p-6 shadow-2xl"><p className="text-sm text-slate-400">Administrator test generator</p><h2 className="mt-2 text-2xl font-bold">Create a new mock test</h2><p className="mt-2 text-sm text-slate-400">Upload source pages, preview them, capture live images, and set time per question.</p><form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm">Test title<input className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Quantitative Aptitude Set 1" /></label><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="block text-sm">Question count<input type="number" min="1" max="30" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3" value={count} onChange={(event) => setCount(event.target.value)} /></label><label className="block text-sm">Timer mode<select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3" value={timerMode} onChange={(event) => setTimerMode(event.target.value)}><option value="CUSTOM">Per-question time</option><option value="STANDARD">Standard</option><option value="SPEED">Speed</option></select></label><label className="block text-sm">Seconds/question<input type="number" min="5" max="3600" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3" value={seconds} onChange={(event) => setSeconds(event.target.value)} /></label><label className="block text-sm">Source mode<select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-3" value={mode} onChange={(event) => setMode(event.target.value)}><option value="AUTO">Auto detect</option><option value="ENGLISH_PRINTED">English printed</option><option value="HANDWRITTEN_OR_OTHER_LANGUAGE">Handwritten / other language</option></select></label></div><input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { addFiles(Array.from(event.target.files || [])); event.target.value = ""; }} /><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => inputRef.current?.click()} className="rounded-2xl border border-dashed border-violet-400/50 bg-violet-500/10 px-4 py-5 text-sm text-violet-200">＋ Upload source images</button><button type="button" onClick={openCamera} className="rounded-2xl border border-dashed border-cyan-400/50 bg-cyan-500/10 px-4 py-5 text-sm text-cyan-200">◉ Open device camera</button></div>{files.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{files.map((item, index) => <div key={`${item.file.name}-${index}`} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950/60"><img src={item.url} alt={`Source page ${index + 1}`} className="h-32 w-full cursor-zoom-in object-cover" onClick={() => { setPreview({ item, index }); setZoom(1); }} /><div className="flex items-center justify-between p-2"><span className="text-[11px] text-slate-400">Page {index + 1}</span><button type="button" className="text-xs text-rose-300" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></div></div>)}</div>}{error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</p>}{notice && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</p>}<button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 font-semibold disabled:opacity-50">{busy ? "Generating…" : "Generate Test"}</button></form></section>{cameraOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 p-4"><section className="w-full max-w-2xl rounded-2xl border border-cyan-300/30 bg-slate-900 p-4 text-white"><h3 className="mb-3 font-semibold">Live camera capture</h3><video ref={videoRef} autoPlay playsInline muted className="max-h-[70vh] w-full rounded-xl bg-black object-contain" /><canvas ref={canvasRef} className="hidden" /><div className="mt-4 flex justify-end gap-2"><button type="button" className="btn btn-ghost text-white" onClick={closeCamera}>Cancel</button><button type="button" className="btn border-0 bg-cyan-500 text-slate-950" onClick={captureCameraImage}>Capture image</button></div></section></div>}{preview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}><section className="w-full max-w-5xl rounded-2xl border border-violet-300/30 bg-slate-900 p-4 text-white"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Image preview · Page {preview.index + 1}</h3><div className="flex items-center gap-1"><button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setZoom((value) => Math.max(1, value - .25))}>−</button><span className="px-2 text-xs">{Math.round(zoom * 100)}%</span><button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setZoom((value) => Math.min(4, value + .25))}>+</button><button type="button" className="btn btn-sm btn-ghost text-white" onClick={() => setPreview(null)}>×</button></div></div><div className="max-h-[75vh] overflow-auto rounded-xl bg-black/30 p-3"><img src={preview.item.url} alt="Full source preview" style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? "100%" : "none" }} className="mx-auto block object-contain" /></div></section></div>}</AdminWorkspaceLayout>;
}
