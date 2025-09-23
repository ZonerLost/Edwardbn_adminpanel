import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseStore } from "../../../lib/firebase";

/** List all contracts */
export async function getContracts() {
  const db = getFirebaseStore();
  const snap = await getDocs(collection(db, "contracts"));
  const rows = [];
  snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
  return rows;
}

/** Fetch single contract by document id */
export async function getContractById(contractId) {
  const db = getFirebaseStore();
  const ref = doc(db, "contracts", contractId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Contract not found");
  return { id: snap.id, ...snap.data() };
}

/** Create a new contract (returns created doc with fields) */
export async function createContract(data) {
  const db = getFirebaseStore();
  const cleaned = sanitizeContract(data);

  // create with timestamps; we'll set contractId = doc.id after creation if not provided
  const ref = await addDoc(collection(db, "contracts"), {
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...cleaned,
  });

  // ensure contractId field exists (handy for external refs)
  if (!cleaned.contractId) {
    await updateDoc(ref, { contractId: ref.id, updatedAt: serverTimestamp() });
  }

  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

/** Partial update (only fields you pass), by document id */
export async function updateContract(contractId, patch) {
  const db = getFirebaseStore();
  const ref = doc(db, "contracts", contractId);
  const cleaned = sanitizeContract(patch);
  await updateDoc(ref, { ...cleaned, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  return { id: snap.id, ...snap.data() };
}

/* ----------------------------- helpers ----------------------------- */
function sanitizeContract(obj = {}) {
  const out = { ...obj };

  // normalize strings
  ["firstName", "lastName", "email", "phoneNumber", "status", "date", "contractId"].forEach((k) => {
    if (out[k] != null) out[k] = String(out[k]).trim();
  });

  // store cardNumber as digits only
  if (out.cardNumber) out.cardNumber = String(out.cardNumber).replace(/\D+/g, "");

  // clamp known statuses
  if (out.status && !["active", "pending", "paused", "closed"].includes(out.status)) {
    out.status = "active";
  }
  return out;
}
