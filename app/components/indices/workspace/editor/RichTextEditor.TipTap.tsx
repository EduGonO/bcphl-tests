import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  ImagePlus,
  Loader2,
} from "lucide-react";

type RichTextEditorTipTapProps = {
  value: string;
  onChange: (html: string, json: any) => void;
  readOnly?: boolean;
  placeholder?: string;
  imageUploadSlug?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
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
    aria-label={label}
    title={label}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all duration-200 ${
      active
        ? "border-fuchsia-500 bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30"
        : "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-300 hover:text-fuchsia-600"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
  >
    {children}
  </button>
);

const RichTextEditorTipTap: React.FC<RichTextEditorTipTapProps> = ({
  value,
  onChange,
  placeholder = "Écrivez ici…",
  readOnly = false,
  imageUploadSlug,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    editable: !readOnly,
    content: value,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto my-3 h-auto max-w-full rounded-xl border border-slate-200",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[240px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70 md:min-h-[300px]",
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

  const uploadImage = useCallback(async (file: File): Promise<string> => {
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
  }, [imageUploadSlug]);

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

  const onLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("URL du lien", previous ?? "https://");
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
  }, [editor]);

  if (!editor) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-500">Chargement…</div>;
  }

  return (
    <div className="tiptap-rich-text w-full space-y-3">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 backdrop-blur">
        <ToolbarButton
          label="Gras"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Italique"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Liste à puces"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Liste numérotée"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton label="Lien" onClick={onLink} active={editor.isActive("link")}>
          <Link2 size={16} />
        </ToolbarButton>
        <ToolbarButton label="Image" onClick={onPickImage} disabled={isUploading}>
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageSelected}
        />
      </div>
      <EditorContent editor={editor} />

      <style jsx global>{`
        .tiptap-rich-text .ProseMirror img {
          display: block;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          margin: 0.75rem auto;
          border-radius: 0.75rem;
        }

        .tiptap-rich-text .ProseMirror {
          overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditorTipTap;
