import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import History from "@tiptap/extension-history";
import TextAlign from "@tiptap/extension-text-align";

type SimpleEditorProps = {
  value?: string;
  onChange?: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

export function SimpleEditor({
  value = "",
  onChange,
  readOnly = false,
  placeholder = "Écrivez ici…",
  imageUploadSlug,
}: SimpleEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    editable: !readOnly,
    content: value,
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      Bold,
      Italic,
      Underline,
      Strike,
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      History,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class: "simple-editor-content",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML(), currentEditor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
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
    },
    [imageUploadSlug]
  );

  const onImageSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      setIsUploading(true);
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [editor, uploadImage]
  );

  if (!editor) return <div>Chargement…</div>;

  return (
    <div className="simple-editor-shell">
      <div className="simple-editor-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()}>Checklist</button>
        <button type="button" onClick={() => {
          const href = window.prompt("URL");
          if (!href) return;
          editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }}>Link</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? "Uploading…" : "Image"}
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageSelected} />
      <EditorContent editor={editor} />
    </div>
  );
}
