import React, { useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import History from "@tiptap/extension-history";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold as BoldIcon,
  ChevronDown,
  ImagePlus,
  Italic as ItalicIcon,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

type SimpleEditorTemplateUiProps = {
  imageUploadSlug?: string;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const SimpleEditorTemplateUi: React.FC<SimpleEditorTemplateUiProps> = ({ imageUploadSlug }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [2, 3] }),
      Bold,
      Italic,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      HardBreak,
      History,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content:
      "<h2>SimpleEditor template UI</h2><p>This mode is built to match the visual toolbar experience (icons + dropdowns).</p>",
    editorProps: {
      attributes: {
        class: "simple-template-ui__content",
      },
    },
  });

  const headingValue = useMemo(() => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "paragraph";
  }, [editor, editor?.state]);

  const listValue = useMemo(() => {
    if (!editor) return "none";
    if (editor.isActive("taskList")) return "task";
    if (editor.isActive("bulletList")) return "bullet";
    if (editor.isActive("orderedList")) return "ordered";
    return "none";
  }, [editor, editor?.state]);

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
    <div className="simple-template-ui">
      <div className="simple-template-ui__toolbar">
        <div className="simple-template-ui__select-wrap">
          <select
            className="simple-template-ui__select"
            value={headingValue}
            onChange={(event) => {
              if (event.target.value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
              else if (event.target.value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
              else editor.chain().focus().setParagraph().run();
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <ChevronDown size={14} className="simple-template-ui__chevron" />
        </div>

        <div className="simple-template-ui__select-wrap">
          <select
            className="simple-template-ui__select"
            value={listValue}
            onChange={(event) => {
              const next = event.target.value;
              if (next === "bullet") editor.chain().focus().toggleBulletList().run();
              if (next === "ordered") editor.chain().focus().toggleOrderedList().run();
              if (next === "task") editor.chain().focus().toggleTaskList().run();
              if (next === "none") {
                if (editor.isActive("bulletList")) editor.chain().focus().toggleBulletList().run();
                if (editor.isActive("orderedList")) editor.chain().focus().toggleOrderedList().run();
                if (editor.isActive("taskList")) editor.chain().focus().toggleTaskList().run();
              }
            }}
          >
            <option value="none">List</option>
            <option value="bullet">Bullet list</option>
            <option value="ordered">Ordered list</option>
            <option value="task">Checklist</option>
          </select>
          <ChevronDown size={14} className="simple-template-ui__chevron" />
        </div>

        <button className={cx("simple-template-ui__btn", editor.isActive("bold") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleBold().run()}><BoldIcon size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("italic") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleItalic().run()}><ItalicIcon size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("underline") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("strike") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("bulletList") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("orderedList") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive("taskList") && "is-active")} type="button" onClick={() => editor.chain().focus().toggleTaskList().run()}><ListChecks size={14} /></button>

        <button className={cx("simple-template-ui__btn", editor.isActive({ textAlign: "left" }) && "is-active")} type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive({ textAlign: "center" }) && "is-active")} type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter size={14} /></button>
        <button className={cx("simple-template-ui__btn", editor.isActive({ textAlign: "right" }) && "is-active")} type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight size={14} /></button>

        <button
          className={cx("simple-template-ui__btn", editor.isActive("link") && "is-active")}
          type="button"
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const href = window.prompt("Enter URL", previous || "https://");
            if (href === null) return;
            if (!href.trim()) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
          }}
        >
          <Link2 size={14} />
        </button>

        <button className="simple-template-ui__btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <ImagePlus size={14} />
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

        <button className="simple-template-ui__btn" type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo2 size={14} /></button>
        <button className="simple-template-ui__btn" type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo2 size={14} /></button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
