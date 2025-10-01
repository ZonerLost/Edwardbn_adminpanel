import React, { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import Header from "../components/partials/header";
import { useAuth } from "../auth/AuthContext";
import { getFirebaseStore } from "../lib/firebase";

function useUserDoc(uid) {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const db = getFirebaseStore();
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setDocData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [uid]);

  return { docData, loading };
}

const fmtDateTime = (v) => {
  try {
    const d =
      typeof v?.toDate === "function" ? v.toDate() : v ? new Date(v) : null;
    if (!d || Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
};

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { docData, loading: docLoading } = useUserDoc(user?.uid);

  const loading = authLoading || docLoading;

  const merged = useMemo(() => {
    if (!user && !docData) return null;
    const createdAt =
      docData?.createdAt ||
      // fallback to Auth metadata if you didn't store createdAt in doc
      (user?.metadata?.creationTime
        ? new Date(user.metadata.creationTime)
        : null);

    return {
      displayName: docData?.displayName || user?.displayName || "Admin",
      email: docData?.email || user?.email || "—",
      phoneNumber: docData?.phoneNumber || "—",
      photoURL:
        docData?.photoURL ||
        user?.photoURL ||
        "https://images.pexels.com/photos/3851914/pexels-photo-3851914.jpeg?auto=compress&cs=tinysrgb&w=600",
      role: docData?.role || "staff",
      status: docData?.status || "active",
      createdAt,
    };
  }, [user, docData]);

  return (
    <div>
      <Header header={"Admin Information"} />
      <div className="max-w-screen-lg mx-auto p-4 xl:px-8 space-y-4 mb-8">
        <div className="bg-white w-full pb-4 px-6">
          <div className="flex items-center justify-between border-b py-3">
            <h4 className="text-2xl font-semibold capitalize">Admin Profile</h4>
            {/* If you want to reuse your Users drawer for editing, navigate there */}
            <a
              href="/users"
              className="capitalize px-6 py-2 text-white bg-gray-150 rounded-md text-sm"
            >
              Edit profile
            </a>
          </div>

          {/* Content */}
          <div className="py-3.5 space-y-5">
            {loading ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-24 h-24 rounded-2xl bg-gray-200" />
                <div className="w-full space-y-3">
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="h-4 w-64 bg-gray-200 rounded" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ) : (
              merged && (
                <div className="flex items-center gap-4">
                  <img
                    className="w-24 h-24 rounded-2xl object-cover border"
                    src={merged.photoURL}
                    alt={merged.displayName}
                  />

                  <div className="w-full space-y-1">
                    <div className="flex justify-between w-full items-start">
                      <div>
                        <h5 className="text-3xl font-semibold">
                          {merged.displayName}
                        </h5>
                        <p className="text-sm text-gray-600">{merged.email}</p>
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                          merged.status === "active"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-gray-500/10 text-gray-700"
                        }`}
                      >
                        {merged.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full text-sm text-[#434343]">
                      <p>{merged.phoneNumber}</p>
                      <p>Member Since {fmtDateTime(merged.createdAt)}</p>
                    </div>

                    <div className="text-xs text-gray-500">
                      Role: <span className="font-medium">{merged.role}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
