import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export default function TipTapEditor({ value, onChange, placeholder = "" }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true, autolink: true, protocols: ["http", "https", "mailto"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose max-w-none min-h-[320px] p-4 focus:outline-none " +
          "prose-sm sm:prose lg:prose-base",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    // Only set when external value actually changes (avoid cursor jumps)
    const current = editor.getHTML();
    if (value != null && value !== current) editor.commands.setContent(value, false);
  }, [value, editor]);

  if (!editor) return <div className="p-4 text-sm text-gray-500">Loading editor…</div>;

  const promptForLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b p-2">
        <button className="btn" onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}>B</button>
        <button className="btn" onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive("italic")}><em>I</em></button>
        <button className="btn" onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-pressed={editor.isActive("strike")}><s>S</s></button>
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <button className="btn" onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive("bulletList")}>• List</button>
        <button className="btn" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-pressed={editor.isActive("orderedList")}>1. List</button>
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <button className="btn" onClick={() => editor.chain().focus().setParagraph().run()}
          aria-pressed={editor.isActive("paragraph")}>P</button>
        <button className="btn" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-pressed={editor.isActive("heading", { level: 2 })}>H2</button>
        <button className="btn" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-pressed={editor.isActive("heading", { level: 3 })}>H3</button>
        <span className="w-px h-6 bg-gray-200 mx-1" />
        <button className="btn" onClick={promptForLink} aria-pressed={editor.isActive("link")}>Link</button>
        <button className="btn" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
      <style>{`
        .btn { font-size:12px; padding:4px 8px; border:1px solid #e5e7eb; border-radius:6px; }
        .btn[aria-pressed="true"] { background:#111; color:#fff; border-color:#111; }
      `}</style>
    </div>
  );
}
