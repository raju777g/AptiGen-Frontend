   import avatar1 from "../assets/avatars/avatar1.png";
   import avatar2 from "../assets/avatars/avatar2.png";
   import avatar3 from "../assets/avatars/avatar3.png";
   import avatar4 from "../assets/avatars/avatar4.png";
   import avatar5 from "../assets/avatars/avatar5.png";
   import avatar6 from "../assets/avatars/avatar6.png";

   export const PREDEFINED_AVATARS = {
     avatar1, avatar2, avatar3, avatar4, avatar5, avatar6,
   };

   export function resolveAvatarSrc(avatarUrl) {
     if (!avatarUrl) return null;
     if (avatarUrl.startsWith("predefined:")) {
       const key = avatarUrl.replace("predefined:", "");
       return PREDEFINED_AVATARS[key] || null;
     }
     return `http://localhost:8080${avatarUrl}`; // uploaded avatars are served from the backend
   }