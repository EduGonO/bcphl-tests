import React, { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { Bold as BoldIcon, ChevronDown, Heading1, Italic as ItalicIcon, Strikethrough, Underline as UnderlineIcon } from "lucide-react";

type SimpleEditorTemplateUiProps = {
  imageUploadSlug?: string;
};

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const headingOptions: Array<{ label: string; value: "paragraph" | 1 | 2 | 3 | 4 | 6 }> = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
  { label: "Heading 4", value: 4 },
  { label: "Heading 6", value: 6 },
];

export const SimpleEditorTemplateUi: React.FC<SimpleEditorTemplateUiProps> = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3, 4, 6] }),
      Bold,
      Italic,
      Underline,
      Strike,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: "<h2>SimpleEditor template toolbar UI</h2><p>Use the heading dropdown + mark buttons like the Tiptap toolbar style.</p>",
    editorProps: {
      attributes: {
        class: "simple-template-ui__content",
      },
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeHeadingLabel = useMemo(() => {
    if (!editor) return "Paragraph";

    for (const option of headingOptions) {
      if (option.value !== "paragraph" && editor.isActive("heading", { level: option.value })) {
        return option.label;
      }
    }

    return "Paragraph";
  }, [editor, editor?.state]);

  if (!editor) return null;

  return (
    <div className="simple-template-ui">
      <div className="simple-template-ui__toolbar simple-template-ui__toolbar--floating" data-plain="false">
        <div className="simple-template-ui__group" ref={menuRef}>
          <button
            type="button"
            className="simple-template-ui__menu-trigger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            title="Heading"
          >
            <Heading1 size={14} />
            <span className="simple-template-ui__trigger-label">{activeHeadingLabel}</span>
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="simple-template-ui__menu" role="menu" aria-label="Headings" data-side="bottom" data-align="start">
              {headingOptions.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  role="menuitem"
                  className={cx(
                    "simple-template-ui__menu-item",
                    option.value === "paragraph"
                      ? editor.isActive("paragraph") && "is-active"
                      : editor.isActive("heading", { level: option.value }) && "is-active"
                  )}
                  onClick={() => {
                    if (option.value === "paragraph") {
                      editor.chain().focus().setParagraph().run();
                    } else {
                      editor.chain().focus().toggleHeading({ level: option.value }).run();
                    }
                    setMenuOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="simple-template-ui__separator" />

        <div className="simple-template-ui__group">
          <button
            type="button"
            className={cx("simple-template-ui__btn", editor.isActive("bold") && "is-active")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
            data-tooltip="Bold"
          >
            <BoldIcon size={14} />
          </button>
          <button
            type="button"
            className={cx("simple-template-ui__btn", editor.isActive("italic") && "is-active")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
            data-tooltip="Italic"
          >
            <ItalicIcon size={14} />
          </button>
          <button
            type="button"
            className={cx("simple-template-ui__btn", editor.isActive("underline") && "is-active")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
            data-tooltip="Underline"
          >
            <UnderlineIcon size={14} />
          </button>
          <button
            type="button"
            className={cx("simple-template-ui__btn", editor.isActive("strike") && "is-active")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Strike"
            data-tooltip="Strike"
          >
            <Strikethrough size={14} />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
