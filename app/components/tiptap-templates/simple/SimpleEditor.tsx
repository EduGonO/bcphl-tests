import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

type SimpleEditorProps = {
  value?: string;
  onChange?: (html: string, json: any) => void;
  placeholder?: string;
  imageUploadSlug?: string;
  readOnly?: boolean;
};

type IconBtnProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

const IconBtn: React.FC<IconBtnProps> = ({ onClick, active = false, disabled = false, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={title}
    className={"simple-editor-btn" + (active ? " is-active" : "")}
  >
    {children}
  </button>
);

export function SimpleEditor({ value = "", onChange, placeholder = "Écrivez ici…", imageUploadSlug, readOnly = false }: SimpleEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("https://");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    content: value,
    extensions: [
      StarterKit.configure({ code: false, codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class: "simple-editor",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML(), e.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Échec de lecture"));
      reader.readAsDataURL(file);
    });
    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, data, slug: imageUploadSlug }),
    });
    const payload = await res.json();
    if (!res.ok || !payload?.url) throw new Error(payload?.error ?? "Échec de l'envoi");
    return payload.url as string;
  }, [imageUploadSlug]);

  const onImageSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [editor, uploadImage]);

  const headingValue = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    return "paragraph";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editor?.state]);

  const listValue = useMemo(() => {
    if (!editor) return "none";
    if (editor.isActive("bulletList")) return "bullet";
    if (editor.isActive("orderedList")) return "ordered";
    return "none";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, editor?.state]);

  if (!editor) return <div style={{ padding: 16, color: "#94a3b8", border: "1px solid #e2e8f0", borderRadius: 8 }}>Chargement…</div>;

  return (
    <div className="simple-editor-wrapper">
      {!readOnly && (
        <div className="simple-editor-toolbar">
          {/* Titres */}
          <div className="simple-editor-toolbar-group">
            <select
              className="simple-editor-select"
              value={headingValue}
              onChange={(ev) => {
                const v = ev.target.value;
                if (v === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
                else if (v === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                else if (v === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                else if (v === "h4") editor.chain().focus().toggleHeading({ level: 4 }).run();
                else editor.chain().focus().setParagraph().run();
              }}
            >
              <option value="paragraph">Paragraphe</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
              <option value="h3">Titre 3</option>
              <option value="h4">Titre 4</option>
            </select>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Listes */}
          <div className="simple-editor-toolbar-group">
            <select
              className="simple-editor-select"
              value={listValue}
              onChange={(ev) => {
                const v = ev.target.value;
                if (v === "bullet") editor.chain().focus().toggleBulletList().run();
                else if (v === "ordered") editor.chain().focus().toggleOrderedList().run();
                else {
                  if (editor.isActive("bulletList")) editor.chain().focus().toggleBulletList().run();
                  if (editor.isActive("orderedList")) editor.chain().focus().toggleOrderedList().run();
                }
              }}
            >
              <option value="none">Liste</option>
              <option value="bullet">• À puces</option>
              <option value="ordered">1. Numérotée</option>
            </select>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Mise en forme */}
          <div className="simple-editor-toolbar-group">
            <IconBtn title="Gras" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
            </IconBtn>
            <IconBtn title="Italique" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
            </IconBtn>
            <IconBtn title="Souligné" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
            </IconBtn>
            <IconBtn title="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4C9.5 4 7 5.5 7 8C7 10 8.5 11 10 11.5"/><path d="M8 18C8 18 9.5 20 12 20C14.5 20 17 18.5 17 16C17 14 15.5 13 14 12.5"/></svg>
            </IconBtn>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Bloc citation */}
          <div className="simple-editor-toolbar-group">
            <IconBtn title="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </IconBtn>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Alignement */}
          <div className="simple-editor-toolbar-group">
            <IconBtn title="Aligner à gauche" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </IconBtn>
            <IconBtn title="Centrer" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </IconBtn>
            <IconBtn title="Aligner à droite" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
            </IconBtn>
            <IconBtn title="Justifier" onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </IconBtn>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Lien */}
          <div className="simple-editor-toolbar-group">
            <IconBtn
              title="Lien"
              onClick={() => {
                const prev = editor.getAttributes("link").href as string | undefined;
                setLinkValue(prev ?? "https://");
                setIsLinkOpen((v) => !v);
              }}
              active={editor.isActive("link")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </IconBtn>
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Image */}
          <div className="simple-editor-toolbar-group">
            <IconBtn
              title={isUploading ? "Envoi en cours…" : "Insérer une image"}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </IconBtn>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageSelected} />
          </div>

          <div className="simple-editor-toolbar-separator" />

          {/* Annuler / Rétablir */}
          <div className="simple-editor-toolbar-group">
            <IconBtn title="Annuler" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
            </IconBtn>
            <IconBtn title="Rétablir" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-4.95"/></svg>
            </IconBtn>
          </div>
        </div>
      )}

      {isLinkOpen && (
        <div className="simple-editor-link-bar">
          <input
            type="url"
            value={linkValue}
            onChange={(ev) => setLinkValue(ev.target.value)}
            placeholder="https://exemple.com"
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                if (linkValue.trim()) {
                  editor.chain().focus().extendMarkRange("link").setLink({ href: linkValue.trim(), target: "_blank" }).run();
                } else {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                }
                setIsLinkOpen(false);
              }
              if (ev.key === "Escape") setIsLinkOpen(false);
            }}
            autoFocus
          />
          <button
            onClick={() => {
              if (linkValue.trim()) {
                editor.chain().focus().extendMarkRange("link").setLink({ href: linkValue.trim(), target: "_blank" }).run();
              } else {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
              }
              setIsLinkOpen(false);
            }}
          >
            Appliquer
          </button>
          <button
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              setIsLinkOpen(false);
            }}
          >
            Supprimer
          </button>
          <button onClick={() => setIsLinkOpen(false)}>Annuler</button>
        </div>
      )}

      <div className="simple-editor-content">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default SimpleEditor;
