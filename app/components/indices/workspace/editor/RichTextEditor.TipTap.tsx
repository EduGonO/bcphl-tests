import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Strikethrough,
  UnderlineIcon,
  Undo2,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Accent colour for active toolbar items — saturated indigo. */
const ACTIVE_BG = "#4f46e5";
const ACTIVE_FG = "#ffffff";
const ACTIVE_BORDER = "#4338ca";

const BASE_BTN =
  "inline-flex h-7 w-7 items-center justify-center rounded transition-all duration-100 text-[#374151] border border-transparent";

const ACTIVE_BTN = `border-[${ACTIVE_BORDER}] text-[${ACTIVE_FG}] bg-[${ACTIVE_BG}]`;

type IconButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  active = false,
  disabled = false,
  label,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    style={
      active
        ? { background: ACTIVE_BG, color: ACTIVE_FG, borderColor: ACTIVE_BORDER }
        : {}
    }
    className={`${BASE_BTN} ${
      active
        ? ""
        : "hover:bg-[#f3f4f6] hover:border-[#d1d5db]"
    } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

const Divider = () => (
  <span className="mx-1 h-5 w-px flex-shrink-0 bg-[#e5e7eb]" aria-hidden />
);

const SELECT_STYLE: React.CSSProperties = {
  height: 28,
  fontSize: 12,
  fontWeight: 500,
  color: "#374151",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  paddingLeft: 8,
  paddingRight: 24,
  appearance: "none",
  WebkitAppearance: "none",
  outline: "none",
  cursor: "pointer",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
  const [tick, setTick] = useState(0); // forces re-render on editor state change
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);

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
        class: "tiptap-content",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: cur }) => {
      onChange(cur.getHTML(), cur.getJSON());
      setTick((n) => n + 1);
    },
    onSelectionUpdate: () => {
      setTick((n) => n + 1);
    },
  });

  // Sync external value changes (e.g. loading a different article)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  // Focus link input when popover opens
  useEffect(() => {
    if (isLinkOpen) {
      setTimeout(() => linkInputRef.current?.focus(), 30);
    }
  }, [isLinkOpen]);

  // -------------------------------------------------------------------------
  // Image upload
  // -------------------------------------------------------------------------

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
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    },
    [editor, uploadImage]
  );

  // -------------------------------------------------------------------------
  // Derived toolbar state
  // -------------------------------------------------------------------------

  const headingLevel: string = !editor
    ? "p"
    : editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : "p";

  const listType: string = !editor
    ? "none"
    : editor.isActive("bulletList")
    ? "bullet"
    : editor.isActive("orderedList")
    ? "ordered"
    : "none";

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const applyHeading = (val: string) => {
    if (!editor) return;
    if (val === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (val === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (val === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
    else editor.chain().focus().setParagraph().run();
  };

  const applyList = (val: string) => {
    if (!editor) return;
    if (val === "bullet") {
      if (editor.isActive("bulletList")) {
        editor.chain().focus().liftListItem("listItem").run();
      } else {
        editor.chain().focus().toggleBulletList().run();
      }
    } else if (val === "ordered") {
      if (editor.isActive("orderedList")) {
        editor.chain().focus().liftListItem("listItem").run();
      } else {
        editor.chain().focus().toggleOrderedList().run();
      }
    } else {
      if (editor.isActive("bulletList") || editor.isActive("orderedList")) {
        editor.chain().focus().liftListItem("listItem").run();
      }
    }
  };

  const openLinkPopover = () => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    setLinkValue(existing ?? "https://");
    setIsLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const href = linkValue.trim();
    if (!href || href === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href, target: "_blank", rel: "noopener noreferrer" })
        .run();
    }
    setIsLinkOpen(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkOpen(false);
  };

  if (!editor) {
    return (
      <div className="tiptap-loading">Chargement…</div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const isBold = editor.isActive("bold");
  const isItalic = editor.isActive("italic");
  const isUnderline = editor.isActive("underline");
  const isStrike = editor.isActive("strike");
  const isLink = editor.isActive("link");
  const isBlockquote = editor.isActive("blockquote");
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  return (
    <div className="tiptap-shell">
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="tiptap-toolbar">
        {/* Heading select */}
        <div className="tiptap-select-wrap">
          <select
            style={SELECT_STYLE}
            value={headingLevel}
            onChange={(e) => applyHeading(e.target.value)}
            aria-label="Niveau de titre"
          >
            <option value="p">Paragraphe</option>
            <option value="h1">Titre 1</option>
            <option value="h2">Titre 2</option>
            <option value="h3">Titre 3</option>
          </select>
          <ChevronDown size={12} className="tiptap-select-icon" />
        </div>

        {/* List select */}
        <div className="tiptap-select-wrap">
          <select
            style={SELECT_STYLE}
            value={listType}
            onChange={(e) => applyList(e.target.value)}
            aria-label="Type de liste"
          >
            <option value="none">Liste</option>
            <option value="bullet">· Puces</option>
            <option value="ordered">1. Numérotée</option>
          </select>
          <ChevronDown size={12} className="tiptap-select-icon" />
        </div>

        <Divider />

        {/* Marks */}
        <IconButton label="Gras (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={isBold}>
          <Bold size={13} />
        </IconButton>
        <IconButton label="Italique (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={isItalic}>
          <Italic size={13} />
        </IconButton>
        <IconButton label="Souligné (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={isUnderline}>
          <UnderlineIcon size={13} />
        </IconButton>
        <IconButton label="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} active={isStrike}>
          <Strikethrough size={13} />
        </IconButton>

        <Divider />

        {/* Link + Blockquote */}
        <IconButton label="Lien" onClick={openLinkPopover} active={isLink}>
          <Link2 size={13} />
        </IconButton>
        <IconButton label="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={isBlockquote}>
          <Quote size={13} />
        </IconButton>

        <Divider />

        {/* Image upload */}
        <IconButton label="Insérer une image" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onImageSelected}
        />

        <Divider />

        {/* Alignment */}
        <IconButton label="Aligner à gauche" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft size={13} />
        </IconButton>
        <IconButton label="Centrer" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter size={13} />
        </IconButton>
        <IconButton label="Aligner à droite" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight size={13} />
        </IconButton>
        <IconButton label="Justifier" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}>
          <AlignJustify size={13} />
        </IconButton>

        <Divider />

        {/* Undo / Redo */}
        <IconButton label="Annuler (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!canUndo}>
          <Undo2 size={13} />
        </IconButton>
        <IconButton label="Rétablir (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!canRedo}>
          <Redo2 size={13} />
        </IconButton>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Link popover                                                         */}
      {/* ------------------------------------------------------------------ */}
      {isLinkOpen && (
        <div className="tiptap-link-popover">
          <Link2 size={14} className="tiptap-link-popover__icon" />
          <input
            ref={linkInputRef}
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") setIsLinkOpen(false);
            }}
            placeholder="https://example.com"
            className="tiptap-link-popover__input"
          />
          <button type="button" className="tiptap-link-popover__btn tiptap-link-popover__btn--apply" onClick={applyLink}>
            Appliquer
          </button>
          {isLink && (
            <button type="button" className="tiptap-link-popover__btn tiptap-link-popover__btn--remove" onClick={removeLink}>
              Retirer
            </button>
          )}
          <button type="button" className="tiptap-link-popover__close" onClick={() => setIsLinkOpen(false)} aria-label="Fermer">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Editor content                                                       */}
      {/* ------------------------------------------------------------------ */}
      <EditorContent editor={editor} />

      {/* ------------------------------------------------------------------ */}
      {/* Styles                                                               */}
      {/* ------------------------------------------------------------------ */}
      <style jsx global>{`
        /* Shell */
        .tiptap-shell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        /* Toolbar */
        .tiptap-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px;
          padding: 5px 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(6px);
        }

        /* Select wrapper */
        .tiptap-select-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
        }
        .tiptap-select-icon {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9ca3af;
        }

        /* Editor area */
        .tiptap-content {
          min-height: 240px;
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 15px;
          line-height: 1.7;
          color: #111827;
          background: #ffffff;
          outline: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tiptap-content:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        /* Placeholder */
        .tiptap-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* Prose styles inside editor */
        .tiptap-content h1 { font-size: 1.75em; font-weight: 700; margin: 0.8em 0 0.4em; line-height: 1.25; }
        .tiptap-content h2 { font-size: 1.4em; font-weight: 700; margin: 0.8em 0 0.4em; line-height: 1.3; }
        .tiptap-content h3 { font-size: 1.15em; font-weight: 600; margin: 0.7em 0 0.35em; line-height: 1.35; }
        .tiptap-content p { margin: 0 0 0.75em; }
        .tiptap-content p:last-child { margin-bottom: 0; }
        .tiptap-content strong { font-weight: 700; }
        .tiptap-content em { font-style: italic; }
        .tiptap-content u { text-decoration: underline; text-underline-offset: 3px; }
        .tiptap-content s { text-decoration: line-through; }
        .tiptap-content a { color: #4f46e5; text-decoration: underline; text-underline-offset: 2px; }
        .tiptap-content a:hover { color: #4338ca; }
        .tiptap-content blockquote {
          border-left: 3px solid #6366f1;
          margin: 1em 0;
          padding: 0.5em 0 0.5em 1em;
          color: #4b5563;
          font-style: italic;
          background: #f5f5ff;
          border-radius: 0 6px 6px 0;
        }
        .tiptap-content ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0 0.75em; }
        .tiptap-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0 0.75em; }
        .tiptap-content li { margin-bottom: 0.2em; }
        .tiptap-content img {
          max-width: 88%;
          height: auto;
          display: block;
          margin: 1em auto;
          border-radius: 8px;
          object-fit: contain;
        }

        /* Link popover */
        .tiptap-link-popover {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        .tiptap-link-popover__icon {
          color: #6b7280;
          flex-shrink: 0;
        }
        .tiptap-link-popover__input {
          flex: 1;
          height: 28px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0 8px;
          font-size: 13px;
          color: #111827;
          background: #f9fafb;
          outline: none;
          min-width: 180px;
        }
        .tiptap-link-popover__input:focus {
          border-color: #6366f1;
          background: #fff;
        }
        .tiptap-link-popover__btn {
          height: 28px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.1s;
        }
        .tiptap-link-popover__btn--apply {
          background: #4f46e5;
          color: #fff;
          border-color: #4338ca;
        }
        .tiptap-link-popover__btn--apply:hover { background: #4338ca; }
        .tiptap-link-popover__btn--remove {
          background: #fff5f5;
          color: #dc2626;
          border-color: #fecaca;
        }
        .tiptap-link-popover__btn--remove:hover { background: #fee2e2; }
        .tiptap-link-popover__close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          border-radius: 4px;
          padding: 0;
        }
        .tiptap-link-popover__close:hover { background: #f3f4f6; color: #374151; }

        /* Loading state */
        .tiptap-loading {
          padding: 16px;
          color: #9ca3af;
          font-size: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorTipTap;
