import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

/** Ensure we only keep safe/short extensions */
function getSafeExt(filename, fallback = "jpg") {
  try {
    const ext = String(filename).split(".").pop()?.toLowerCase() || fallback;
    // tiny allowlist; expand if you need more types
    const ok = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg", "pdf"];
    return ok.includes(ext) ? ext : fallback;
  } catch {
    return fallback;
  }
}

/** Generate a short random id (safe for client use) */
function rid(len = 8) {
  // Fallback if crypto not available
  if (!window.crypto?.getRandomValues) return Math.random().toString(36).slice(2, 2 + len);
  const bytes = new Uint8Array(len);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

/** Build a path for contract assets */
export function buildContractPath(contractId, kind, file) {
  const ext = getSafeExt(file?.name || "asset.jpg");
  return `contracts/${contractId}/${kind}-${Date.now()}-${rid(6)}.${ext}`;
}

/**
 * Core uploader (resumable). Returns { url, fullPath, cancel }.
 * onProgress?: (0..100)
 */
export function uploadFile({ path, file, onProgress }) {
  if (!file) return Promise.reject(new Error("No file to upload"));
  const storage = getFirebaseStorage();
  const ref = storageRef(storage, path);

  const task = uploadBytesResumable(ref, file, {
    contentType: file.type || "application/octet-stream",
    // you can add customMetadata here if needed
  });

  const p = new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (err) => {
        const msg = String(err?.code || err?.message || "");
        if (msg.includes("storage/retry-limit-exceeded")) {
          reject(new Error("Upload took too long or kept failing. Check your connection or try a smaller image."));
        } else if (msg.includes("storage/unauthorized")) {
          reject(new Error("You don't have permission to upload to this path. Check Storage rules."));
        } else {
          reject(err);
        }
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, fullPath: task.snapshot.ref.fullPath });
      }
    );
  });

  // allow cancel from UI if needed
  p.cancel = () => task.cancel();
  return p;
}

/** Upload three optional images for a contract in parallel */
export async function uploadContractImages(contractId, files, onProgressMap = {}) {
  const jobs = [];
  const result = { driverUrl: null, licenseUrl: null, signatureUrl: null };

  if (files?.driver) {
    jobs.push(
      uploadFile({
        path: buildContractPath(contractId, "driver", files.driver),
        file: files.driver,
        onProgress: onProgressMap.driver,
      }).then(({ url }) => (result.driverUrl = url))
    );
  }
  if (files?.license) {
    jobs.push(
      uploadFile({
        path: buildContractPath(contractId, "license", files.license),
        file: files.license,
        onProgress: onProgressMap.license,
      }).then(({ url }) => (result.licenseUrl = url))
    );
  }
  if (files?.signature) {
    jobs.push(
      uploadFile({
        path: buildContractPath(contractId, "signature", files.signature),
        file: files.signature,
        onProgress: onProgressMap.signature,
      }).then(({ url }) => (result.signatureUrl = url))
    );
  }

  await Promise.all(jobs);
  return result;
}

/** Optional helper for deletes (e.g., when replacing files) */
export async function deleteByPath(fullPath) {
  const storage = getFirebaseStorage();
  const ref = storageRef(storage, fullPath);
  try {
    await deleteObject(ref);
    return true;
  } catch (e) {
    // ignore not-found; rethrow others if you want
    if (String(e?.code || "").includes("storage/object-not-found")) return false;
    throw e;
  }
}
