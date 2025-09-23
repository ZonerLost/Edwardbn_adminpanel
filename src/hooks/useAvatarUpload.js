import { useCallback } from "react";
import { getFirebaseStorage } from "../lib/firebase";
import { ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";


export function useAvatarUpload() {
return useCallback(async (file, userId) => {
if (!file || !userId) return null;
const storage = getFirebaseStorage();
const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
const path = `users/${userId}/avatar-${Date.now()}.${ext}`;
const r = sRef(storage, path);
await uploadBytes(r, file, { contentType: file.type });
return await getDownloadURL(r);
}, []);
}