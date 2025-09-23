import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseStore } from "../lib/firebase";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null); // { role, status, permissions? }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const auth = await getFirebaseAuth();
      unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          try {
            const db = getFirebaseStore();
            const snap = await getDoc(doc(db, "users", u.uid));
            const data = snap.exists() ? snap.data() : {};
            // sensible defaults if fields missing
            setClaims({
              role: data.role || "staff",
              status: data.status || "active",
              permissions: Array.isArray(data.permissions) ? data.permissions : [],
            });
          } catch (e) {
            console.error("Failed to load profile:", e);
            setClaims({ role: "staff", status: "active", permissions: [] });
          }
        } else {
          setClaims(null);
        }
        setLoading(false);
      });
    })();
    return () => unsub();
  }, []);

  return <Ctx.Provider value={{ user, claims, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
