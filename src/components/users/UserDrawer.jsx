import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createUserWithAuth, // <-- creates Auth user + users/{uid} doc
  updateUserLocal, // <-- updates Firestore + Auth (self), or sends reset (other)
  deleteUserLocal,
  createUserProfile,
} from "../../features/db/users/api";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";
import AvatarPicker from "./AvatarPicker";
import UserForm from "./UserForm";
import DetailsView from "./DetailsView";
import { validateUser, isValidE164 } from "../../utils/validation";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function UserDrawer({
  isOpen,
  onClose,
  user, // user doc or null
  startInEdit = false,
  onSaved,
  onDeleted,
}) {
  const isCreate = !user;
  const [editing, setEditing] = useState(isCreate || startInEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const uploadAvatarForId = useAvatarUpload();

  // NOTE: add "currentPassword" (for self-reauth) and "newPassword" (for self change)
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    photoURL: "",
    role: "",
    status: "",
    permissions: [],
    password: "", // used only on CREATE
    currentPassword: "", // used only when self editing email/password
    newPassword: "", // used only when self editing password
  });

  // keep editing mode synced when (re)opening
  useEffect(() => setEditing(isCreate || startInEdit), [isCreate, startInEdit]);

  useEffect(() => {
    if (!isOpen) return;
    if (user) {
      const url = user.photoURL || "";
      setForm({
        displayName: user.displayName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        photoURL: url,
        role: user.role || "staff",
        status: user.status || "active",
        permissions: Array.isArray(user.permissions) ? user.permissions : [],
        password: "",
        currentPassword: "",
        newPassword: "",
      });
      setAvatarFile(null);
      setAvatarPreview(url);
    } else {
      setForm({
        displayName: "",
        email: "",
        phoneNumber: "",
        photoURL: "",
        role: "",
        status: "",
        permissions: [],
        password: "",
        currentPassword: "",
        newPassword: "",
      });
      setAvatarFile(null);
      setAvatarPreview("");
    }
  }, [isOpen, user]);

  // close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const me = getAuth().currentUser;
  const isSelf = useMemo(() => {
    if (!me || !user) return false;
    // prefer doc id === Auth uid; fall back to uid field or email
    return user.id === me.uid || user.uid === me.uid || user.email === me.email;
  }, [me, user]);

  const validate = () => validateUser(form, { creating: isCreate });

  async function handleSave() {
    const err = validate();
    if (err) return toast.error(err);
    setSaving(true);

    try {
      const basePayload = {
        email: form.email.trim(),
        displayName: form.displayName.trim(),
        ...(form.phoneNumber && isValidE164(form.phoneNumber.trim())
          ? { phoneNumber: form.phoneNumber.trim() }
          : {}),
        role: form.role,
        status: form.status,
        permissions: form.role === "admin" ? form.permissions : [],
      };

      if (isCreate) {
        // 1) create (include password if provided)
        const payload = {
          ...basePayload,
          ...(form.password && form.password.trim().length >= 6
            ? { password: form.password.trim() }
            : {}),
        };
        const created = await toast.promise(createUserWithAuth(payload), {
          loading: "Creating user…",
          success: "User created",
          error: "Failed to create user",
        });

        // 2) avatar (optional)
        if (avatarFile) {
          const url = await toast.promise(
            uploadAvatarForId(avatarFile, created.id),
            {
              loading: "Uploading avatar…",
              success: "Avatar uploaded",
              error: "Failed to upload avatar",
            }
          );
          await updateUserLocal(created.id, { photoURL: url });
          created.photoURL = url; // reflect in object we send up
        }

        // 3) tell parent and CLOSE — do NOT setEditing(false)
        onSaved?.(created);
        onClose(); // 👈 closes the drawer so details aren’t shown
        return; // important to stop here
      }

      // ----- UPDATE path -----
      const patch = { ...basePayload, password: (form.password || "").trim() };
      if (avatarFile) {
        const url = await toast.promise(
          uploadAvatarForId(avatarFile, user.id),
          {
            loading: "Uploading avatar…",
            success: "Avatar uploaded",
            error: "Failed to upload avatar",
          }
        );
        patch.photoURL = url;
      } else if (form.photoURL === "") {
        patch.photoURL = ""; // explicit remove
      }

      const updated = await toast.promise(updateUserLocal(user.id, patch), {
        loading: "Saving changes…",
        success: "User updated",
        error: "Failed to update user",
      });

      setEditing(false); // ok to show details after editing an existing user
      onSaved?.(updated);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isCreate || !user?.id) return;
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      setDeleting(true);
      await toast.promise(deleteUserLocal(user.id), {
        loading: "Deleting…",
        success: "User deleted",
        error: "Failed to delete user",
      });
      onDeleted?.(user.id);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  async function sendResetLink() {
    try {
      const email = (form.email || user?.email || "").trim();
      if (!email) throw new Error("No email on file for this user.");
      await toast.promise(sendPasswordResetEmail(getAuth(), email), {
        loading: "Sending reset link…",
        success: "Reset link sent.",
        error: "Failed to send reset link",
      });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to send reset link.");
    }
  }

  if (!isOpen) return null;

  // close only when clicking the backdrop itself
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropMouseDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" aria-hidden="true" />

      {/* Panel */}
      <div
        className="relative ml-auto h-full w-full sm:w-[640px] bg-white shadow-xl overflow-y-auto motion-safe:transition-transform motion-safe:duration-300"
        style={{ transform: "translateX(0)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isCreate ? "New User" : "User Details"}
          </h2>
          <div className="flex items-center gap-2">
            {!isCreate && !isSelf && (
              <button
                type="button"
                onClick={sendResetLink}
                className="px-3 py-1 rounded border text-sm"
                title="Send password reset email"
              >
                Send reset link
              </button>
            )}

            {!isCreate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}

            {!editing ? (
              <button
                className="px-3 py-1 rounded bg-black text-white text-sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : isCreate ? "Create" : "Save"}
                </button>
                <button
                  className="px-3 py-1 rounded border text-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              className="text-gray-600 hover:text-black"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AvatarPicker
            preview={avatarPreview}
            setPreview={setAvatarPreview}
            file={avatarFile}
            setFile={setAvatarFile}
          />

          {editing ? (
            <UserForm
              form={form}
              setForm={setForm}
              creating={isCreate}
              isSelf={isSelf}
              /** Your UserForm should:
               *  - On create: show email + password fields.
               *  - On edit self: show email, currentPassword, newPassword.
               *  - On edit other: hide password fields (use “Send reset link” button above).
               */
            />
          ) : (
            <DetailsView
              user={{ ...user, photoURL: avatarPreview || user?.photoURL }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
