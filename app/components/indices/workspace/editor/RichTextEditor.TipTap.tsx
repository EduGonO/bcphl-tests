import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  ChevronDown,
  Heading,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

const toolbarButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const toolbarIconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

const activeButtonClass = "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700";

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
        <div className="relative inline-flex items-center">
          <Heading size={15} className="pointer-events-none absolute left-2.5 text-slate-500" />
          <select
            className="h-9 appearance-none rounded-md border border-slate-300 bg-white pl-8 pr-7 text-sm text-slate-700"
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
          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-500" />
        </div>

        <div className="relative inline-flex items-center">
          {(editor.isActive("orderedList") ? (
            <ListOrdered size={15} className="pointer-events-none absolute left-2.5 text-slate-500" />
          ) : (
            <List size={15} className="pointer-events-none absolute left-2.5 text-slate-500" />
          ))}
          <select
            className="h-9 appearance-none rounded-md border border-slate-300 bg-white pl-8 pr-7 text-sm text-slate-700"
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
          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-slate-500" />
        </div>

        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("bold") ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Gras"
          title="Gras"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("italic") ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italique"
          title="Italique"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("underline") ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Souligné"
          title="Souligné"
        >
          <UnderlineIcon size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("strike") ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Barré"
          title="Barré"
        >
          <Strikethrough size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("link") ? activeButtonClass : ""}`}
          onClick={openLinkPopover}
          aria-label="Lien"
          title="Lien"
        >
          <Link2 size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive("blockquote") ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Citation"
          title="Citation"
        >
          <Quote size={15} />
        </button>

        <button type="button" className={toolbarIconButtonClass} onClick={onPickImage} disabled={isUploading}>
          {isUploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive({ textAlign: "left" }) ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          aria-label="Aligner à gauche"
          title="Aligner à gauche"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive({ textAlign: "center" }) ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          aria-label="Centrer"
          title="Centrer"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive({ textAlign: "right" }) ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          aria-label="Aligner à droite"
          title="Aligner à droite"
        >
          <AlignRight size={15} />
        </button>
        <button
          type="button"
          className={`${toolbarIconButtonClass} ${editor.isActive({ textAlign: "justify" }) ? activeButtonClass : ""}`}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          aria-label="Justifier"
          title="Justifier"
        >
          <AlignJustify size={15} />
        </button>

        <button
          type="button"
          className={toolbarIconButtonClass}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Annuler"
          title="Annuler"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          className={toolbarIconButtonClass}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Rétablir"
          title="Rétablir"
        >
          <Redo2 size={15} />
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
