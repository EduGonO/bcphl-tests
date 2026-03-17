import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

const toolbarButtonClass =
  "rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50";

const RichTextEditorTipTap: React.FC<RichTextEditorTipTapProps> = ({
  value,
  onChange,
  placeholder = "Écrivez ici…",
  readOnly = false,
  imageUploadSlug,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    editable: !readOnly,
    content: value,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prosemirror prose prose-slate max-w-none min-h-[240px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 md:min-h-[300px]",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML(), current.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
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

  const onPickImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onImageSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;
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
    },
    [editor, uploadImage]
  );

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkValue(previous ?? "https://");
    setIsLinkOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkValue.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkOpen(false);
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkValue.trim(), target: "_blank", rel: "noopener noreferrer" })
      .run();
    setIsLinkOpen(false);
  }, [editor, linkValue]);

  if (!editor) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">Chargement…</div>;
  }

  return (
    <div className="w-full space-y-3">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 backdrop-blur">
        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
          value={editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : "paragraph"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            else if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <option value="paragraph">Paragraphe</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <select
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
          value={editor.isActive("bulletList") ? "bullet" : editor.isActive("orderedList") ? "ordered" : "none"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "bullet") editor.chain().focus().toggleBulletList().run();
            else if (value === "ordered") editor.chain().focus().toggleOrderedList().run();
            else editor.chain().focus().liftListItem("listItem").run();
          }}
        >
          <option value="none">Liste</option>
          <option value="bullet">Puces</option>
          <option value="ordered">Numérotée</option>
        </select>

        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().toggleBold().run()}>
          Gras
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italique
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          Souligné
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().toggleStrike().run()}>
          Barré
        </button>
        <button type="button" className={toolbarButtonClass} onClick={openLinkPopover}>
          Lien
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Citation
        </button>

        <button type="button" className={toolbarButtonClass} onClick={onPickImage} disabled={isUploading}>
          {isUploading ? "Upload…" : "Image"}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          Gauche
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          Centre
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          Droite
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          Justifié
        </button>

        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().undo().run()}>
          Annuler
        </button>
        <button type="button" className={toolbarButtonClass} onClick={() => editor.chain().focus().redo().run()}>
          Rétablir
        </button>
      </div>

      {isLinkOpen && (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          <input
            type="url"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
          />
          <button type="button" className={toolbarButtonClass} onClick={applyLink}>
            Appliquer
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setIsLinkOpen(false);
            }}
          >
            Retirer
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      <style jsx global>{`
        .prosemirror img,
        .ProseMirror img {
          max-width: 88%;
          height: auto;
          object-fit: contain;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorTipTap;
