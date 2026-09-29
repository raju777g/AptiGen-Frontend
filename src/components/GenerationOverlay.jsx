import { useEffect, useRef, useState } from "react";
import robotSmall from "../assets/robot-small.png";

   const STATUS_MESSAGES = [
     "📸 Reading your pages...",
     "🧠 Gemini Vision is reading your images...",
     "🔎 Detecting notes or existing MCQs...",
     "✨ Casting a bit of AptiGen magic...",
     "📝 Building your mock test...",
   ];

   export default function GenerationOverlay({ active }) {
     const audioRef = useRef(null);
     const visualRef = useRef(null);
     const [statusIndex, setStatusIndex] = useState(0);

     const handleVisualMove = (event) => {
       const rect = event.currentTarget.getBoundingClientRect();
       const x = (event.clientX - rect.left) / rect.width - 0.5;
       const y = (event.clientY - rect.top) / rect.height - 0.5;
       visualRef.current?.style.setProperty("--tilt-x", `${-y * 24}deg`);
       visualRef.current?.style.setProperty("--tilt-y", `${x * 30}deg`);
       event.currentTarget.style.setProperty("--pointer-x", `${(x + 0.5) * 100}%`);
       event.currentTarget.style.setProperty("--pointer-y", `${(y + 0.5) * 100}%`);
     };

     const resetVisual = () => {
       visualRef.current?.style.setProperty("--tilt-x", "0deg");
       visualRef.current?.style.setProperty("--tilt-y", "0deg");
     };

     // Play/stop the looping chime in sync with the overlay's visibility
     useEffect(() => {
       if (!audioRef.current) return;
       if (active) {
         audioRef.current.currentTime = 0;
         audioRef.current.volume = 0.35;
         audioRef.current.play().catch(() => {
           // Autoplay can still be blocked in rare cases (e.g. if this isn't
           // treated as a direct result of the click) — fail silently rather
           // than throwing, since the visual animation still works without sound.
         });
       } else {
         audioRef.current.pause();
       }
     }, [active]);

     // Cycle through status messages every 2.2s while active
     useEffect(() => {
       if (!active) {
         setStatusIndex(0);
         return;
       }
       const interval = setInterval(() => {
         setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
       }, 2200);
       return () => clearInterval(interval);
     }, [active]);

     if (!active) return null;

     const sparkles = Array.from({ length: 14 });

     return (
      <div className="generation-overlay fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/65">
         <audio ref={audioRef} src="/sounds/magic-chime2.mp3" loop />

         {/* floating sparkles, randomized starting positions */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {sparkles.map((_, i) => (
             <span
               key={i}
               className="absolute text-2xl animate-sparkle"
               style={{
                 left: `${(i * 37) % 100}%`,
                 top: `${50 + ((i * 23) % 40) - 20}%`,
                 animationDelay: `${(i % 7) * 0.35}s`,
               }}
             >
               ✨
             </span>
           ))}
         </div>

         <div className="generation-content relative z-10 flex flex-col items-center text-center px-6">
           <div className="generation-scene relative mb-7 flex h-56 w-64 items-center justify-center sm:h-64 sm:w-72" onPointerMove={handleVisualMove} onPointerLeave={resetVisual}>
             <div className="generation-scene-glow absolute inset-8 rounded-full" />
             <div className="generation-orbit generation-orbit-one absolute h-44 w-44 rounded-full sm:h-52 sm:w-52" />
             <div className="generation-orbit generation-orbit-two absolute h-36 w-56 rounded-[50%] sm:h-40 sm:w-64" />
             <div ref={visualRef} className="generation-robot relative grid h-40 w-40 place-items-center sm:h-48 sm:w-48">
               <div className="generation-robot-back absolute inset-5 rounded-[2rem]" />
               <img src={robotSmall} alt="AptiGen assistant preparing your test" className="generation-robot-image relative z-10 h-36 w-36 select-none object-contain sm:h-44 sm:w-44" draggable="false" />
               <span className="generation-float-chip generation-float-chip-left absolute -left-2 top-7 z-20 rounded-xl border border-white/15 bg-slate-900/75 px-3 py-2 text-lg shadow-lg">&#128196;</span>
               <span className="generation-float-chip generation-float-chip-right absolute -right-1 bottom-5 z-20 rounded-xl border border-white/15 bg-slate-900/75 px-3 py-2 text-lg shadow-lg">&#10024;</span>
             </div>
           </div>
           <h2 className="font-hero font-bold text-2xl text-white mb-2">Generating your test...</h2>
           <p className="text-white/70 text-sm transition-opacity duration-300 min-h-[1.25rem]">
             {STATUS_MESSAGES[statusIndex]}
           </p>

           <div className="w-56 h-1.5 bg-white/10 rounded-full mt-6 overflow-hidden">
             <div
               className="h-full rounded-full"
               style={{
                 background: "linear-gradient(90deg,#6366F1,#A855F7)",
                 animation: "indeterminate-progress 1.8s ease-in-out infinite",
               }}
             />
           </div>
         </div>
       </div>
     );
   }
