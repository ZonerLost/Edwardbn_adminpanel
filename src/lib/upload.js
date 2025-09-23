import { ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "../lib/firebase";

export async function uploadToStorage(path, file, onProgress) {
  const storage = getFirebaseStorage();
  const ref = sRef(storage, path);

  return await new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref, file, { contentType: file.type });

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (err) => {
        // Better messages
        const msg = String(err?.code || err?.message || "");
        if (msg.includes("storage/retry-limit-exceeded")) {
          reject(new Error("Upload took too long or kept failing. Please check your connection or try a smaller image."));
        } else if (msg.includes("storage/unauthorized")) {
          reject(new Error("You don't have permission to upload to this path (check Storage rules)."));
        } else {
          reject(err);
        }
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
