import React, { useEffect } from "react";
const MAX_IMAGE_MB = 5;

export default function AvatarPicker({ preview, setPreview, file, setFile }) {
  const inputId = "avatar-file-input";

  useEffect(() => {
    return () => {
      // Cleanup object URL on unmount
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onPickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/"))
      return alert("Please choose an image file.");
    if (f.size > MAX_IMAGE_MB * 1024 * 1024)
      return alert(`Image must be under ${MAX_IMAGE_MB} MB.`);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearAvatar = () => {
    setFile(null);
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
  };

  return (
    <div className="flex items-center gap-4">
      <img
        className="w-16 h-16 rounded-full object-cover border"
        src={preview || "https://i.pravatar.cc/128?u=placeholder"}
        alt="avatar"
      />
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickImage}
        />
        <label
          htmlFor={inputId}
          className="inline-flex items-center px-3 py-1.5 rounded border text-sm cursor-pointer"
        >
          {preview ? "Replace image" : "Upload image"}
        </label>
        {preview && (
          <button
            type="button"
            onClick={clearAvatar}
            className="px-3 py-1.5 rounded border text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
