import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ImagePlus,
  Italic,
  Link2,
  Loader2,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  UnderlineIcon,
  Undo2,
} from "lucide-react";

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

type IconButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

const iconButtonBase =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border text-slate-600 transition-colors";

const IconButton: React.FC<IconButtonProps> = ({ onClick, active = false, disabled = false, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className={`${iconButtonBase} ${
      active
        ? "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700"
        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
  >
    {children}
  </button>
);

const selectClass =
  "h-8 rounded-md border border-slate-200 bg-white px-2 pr-7 text-xs font-medium text-slate-700 focus:border-fuchsia-400 focus:outline-none";

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
          "ProseMirror prose prose-slate max-w-none min-h-[240px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 md:min-h-[300px]",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML(), current.getJSON());
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

  const headingValue = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  }, [editor, editor?.state]);

  const listValue = useMemo(() => {
    if (!editor) return "none";
    if (editor.isActive("bulletList")) return "bullet";
    if (editor.isActive("orderedList")) return "ordered";
    return "none";
  }, [editor, editor?.state]);

  if (!editor) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-500">Chargement…</div>;
  }

  return (
    <div className="w-full space-y-3">
      <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white/95 p-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative">
            <select
              className={selectClass}
              value={headingValue}
              onChange={(event) => {
                if (event.target.value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (event.target.value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                else editor.chain().focus().setParagraph().run();
              }}
            >
              <option value="paragraph">Paragraphe</option>
              <option value="h2">Titre 2</option>
              <option value="h3">Titre 3</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          <div className="relative">
            <select
              className={selectClass}
              value={listValue}
              onChange={(event) => {
                if (event.target.value === "bullet") editor.chain().focus().toggleBulletList().run();
                else if (event.target.value === "ordered") editor.chain().focus().toggleOrderedList().run();
                else {
                  editor.chain().focus().toggleBulletList().run();
                  editor.chain().focus().toggleBulletList().run();
                }
              }}
            >
              <option value="none">Liste</option>
              <option value="bullet">Puces</option>
              <option value="ordered">Numérotée</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          <span className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton label="Gras" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
            <Bold size={14} />
          </IconButton>
          <IconButton label="Italique" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
            <Italic size={14} />
          </IconButton>
          <IconButton label="Souligné" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
            <UnderlineIcon size={14} />
          </IconButton>
          <IconButton label="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
            <Strikethrough size={14} />
          </IconButton>
          <IconButton label="Lien" onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            setLinkValue(previous ?? "https://");
            setIsLinkOpen((open) => !open);
          }} active={editor.isActive("link")}>
            <Link2 size={14} />
          </IconButton>
          <IconButton label="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
            <Quote size={14} />
          </IconButton>

          <span className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton label="Image" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onImageSelected}
          />

          <span className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton label="Aligner à gauche" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
            <AlignLeft size={14} />
          </IconButton>
          <IconButton label="Centrer" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
            <AlignCenter size={14} />
          </IconButton>
          <IconButton label="Aligner à droite" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
            <AlignRight size={14} />
          </IconButton>
          <IconButton label="Justifier" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}>
            <AlignJustify size={14} />
          </IconButton>

          <span className="mx-1 h-6 w-px bg-slate-200" />

          <IconButton label="Annuler" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
            <Undo2 size={14} />
          </IconButton>
          <IconButton label="Rétablir" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
            <Redo2 size={14} />
          </IconButton>
        </div>
      </div>

      {isLinkOpen && (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
          <input
            type="url"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://example.com"
            className="h-8 flex-1 rounded-md border border-slate-300 bg-white px-2 text-sm"
          />
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => {
              if (!linkValue.trim()) {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: linkValue.trim(), target: "_blank", rel: "noopener noreferrer" })
                  .run();
              }
              setIsLinkOpen(false);
            }}
          >
            <Link2 size={12} />
            Appliquer
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setIsLinkOpen(false);
            }}
          >
            <RemoveFormatting size={12} />
            Retirer
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }

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
