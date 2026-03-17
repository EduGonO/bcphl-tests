import React, { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

type SimpleEditorProps = {
  imageUploadSlug?: string;
};

export const SimpleEditor: React.FC<SimpleEditorProps> = ({ imageUploadSlug }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: `<h2>Simple editor</h2><p>This is the default simple setup.</p>`,
    editorProps: {
      attributes: {
        class: "simple-editor__content",
      },
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Image read failed"));
      reader.readAsDataURL(file);
    });

    const response = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        data,
        slug: imageUploadSlug,
      }),
    });

    const payload = await response.json();
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error ?? "Upload failed");
    }

    return payload.url as string;
  };

  if (!editor) return null;

  return (
    <div className="simple-editor">
      <div className="simple-editor__toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}>Strike</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet list</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered list</button>
        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()}>Checklist</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}>Left</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}>Center</button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}>Right</button>
        <button
          type="button"
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const href = window.prompt("Enter URL", previous || "https://");
            if (href === null) return;
            if (!href.trim()) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: href.trim(), target: "_blank", rel: "noopener noreferrer" })
              .run();
          }}
        >
          Link
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? "Uploading…" : "Image"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setIsUploading(true);
            try {
              const url = await uploadImage(file);
              editor.chain().focus().setImage({ src: url, alt: file.name }).run();
            } catch (error) {
              console.error(error);
            } finally {
              setIsUploading(false);
              event.target.value = "";
            }
          }}
        />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>Redo</button>
      </div>

      <EditorContent editor={editor} />

      <style jsx>{`
        .simple-editor { border: 1px solid #d1d5db; border-radius: 8px; background: #fff; }
        .simple-editor__toolbar { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .simple-editor__toolbar button { font-size: 12px; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; background: #fff; }
        .simple-editor :global(.simple-editor__content) { min-height: 320px; padding: 16px; outline: none; }
        .simple-editor :global(.simple-editor__content p.is-editor-empty:first-child::before) { content: attr(data-placeholder); color: #9ca3af; float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  );
};
