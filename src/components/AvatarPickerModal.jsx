   import { useRef, useState } from "react";
   import { useAuthStore } from "../store/authStore";
   import { PREDEFINED_AVATARS } from "../utils/avatarResolver";

   export default function AvatarPickerModal({ open, onClose }) {
     const { setPredefinedAvatar, uploadAvatar } = useAuthStore();
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const fileInputRef = useRef(null);

     if (!open) return null;

     const handlePick = async (key) => {
       setError(""); setBusy(true);
       try {
         await setPredefinedAvatar(key);
         onClose();
       } catch {
         setError("Could not update avatar");
       } finally {
         setBusy(false);
       }
     };

     const handleFile = async (e) => {
       const file = e.target.files?.[0];
       if (!file) return;
       setError(""); setBusy(true);
       try {
         await uploadAvatar(file);
         onClose();
       } catch (err) {
         setError(err.response?.data?.message || "Could not upload image");
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="modal modal-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
         <div className="modal-box">
           <h3 className="font-bold text-lg mb-4">Choose your avatar</h3>

           <div className="grid grid-cols-3 gap-3 mb-4">
             {Object.entries(PREDEFINED_AVATARS).map(([key, src]) => (
               <button
                 key={key} disabled={busy}
                 onClick={() => handlePick(key)}
                 className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors"
               >
                 <img src={src} alt={key} className="w-full h-full object-cover" />
               </button>
             ))}
           </div>

           <div className="divider text-xs">OR</div>

           <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
           <button
             className="btn btn-outline w-full"
             disabled={busy}
             onClick={() => fileInputRef.current?.click()}
           >
             📁 Upload from device
           </button>

           {error && <div className="alert alert-error text-sm mt-3">{error}</div>}

           <div className="modal-action">
             <button className="btn btn-ghost" onClick={onClose}>Close</button>
           </div>
         </div>
       </div>
     );
   }