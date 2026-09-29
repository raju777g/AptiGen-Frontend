   export default function LogoutConfirmModal({ open, onConfirm, onCancel }) {
     if (!open) return null;
     return (
       <div className="modal modal-open" onClick={(e) => e.target === e.currentTarget && onCancel()}>
         <div className="modal-box text-center">
           <div className="text-4xl mb-2">👋</div>
           <h3 className="font-bold text-lg">Log out of AptiGen?</h3>
           <p className="text-sm text-base-content/60 mt-1">You'll need to log back in to continue.</p>
           <div className="modal-action justify-center">
             <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
             <button className="btn btn-error" onClick={onConfirm}>Log Out</button>
           </div>
         </div>
       </div>
     );
   }