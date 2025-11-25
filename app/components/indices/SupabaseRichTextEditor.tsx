import dynamic from "next/dynamic";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TurndownService from "turndown";
import { marked } from "marked";

import type ReactQuillType from "react-quill";
import type { ReactQuillProps } from "react-quill";

import "react-quill/dist/quill.snow.css";

type SupabaseRichTextEditorProps = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  articleId?: string;
  articleSlug?: string;
  readOnly?: boolean;
  placeholder?: string;
};

const ReactQuill = dynamic<ReactQuillProps>(() =>
  import("react-quill").then(({ default: QuillComponent }) =>
    forwardRef<ReactQuillType, ReactQuillProps>((props, ref) => (
      <QuillComponent ref={ref} {...props} />
    ))
  ),
  {
    ssr: false,
    loading: () => (
      <div className="supabase-rich-text__loading">Chargement de l’éditeur…</div>
    ),
  }
) as unknown as React.ForwardRefExoticComponent<
  ReactQuillProps & React.RefAttributes<ReactQuillType>
>;

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "script",
  "blockquote",
  "code-block",
  "link",
  "image",
];

const EMPTY_HTML = "<p><br></p>";

const normalizeMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  return markdown
    .replace(/\r\n?/g, "\n")
    .replace(/\\+n/g, "\n")
    .replace(/\\(?=\n)/g, "");
};

const renderMarkdownToHtml = (markdown: string): string => {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized.trim()) {
    return "";
  }
  return marked.parse(normalized, { breaks: true }) as string;
};

const normalizeHtml = (html: string): string => {
  if (!html || html === EMPTY_HTML) {
    return "";
  }
  return html;
};

const allowedImageTypes = new Set(["image/png", "image/jpeg"]);
const allowedExtensions = new Set(["png", "jpg", "jpeg"]);

const SupabaseRichTextEditor: React.FC<SupabaseRichTextEditorProps> = ({
  value,
  onChange,
  articleId,
  articleSlug,
  readOnly = false,
  placeholder,
}) => {
  const quillRef = useRef<ReactQuillType | null>(null);
  const turndown = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    service.keep(["sup", "sub"]);
    service.addRule("breaks", {
      filter: "br",
      replacement: () => "\n",
    });
    return service;
  }, []);

  const initialMarkdown = useMemo(() => normalizeMarkdown(value), [value]);
  const [htmlValue, setHtmlValue] = useState<string>(() =>
    renderMarkdownToHtml(initialMarkdown) || EMPTY_HTML
  );
  const lastMarkdownRef = useRef(initialMarkdown);

  useEffect(() => {
    const normalizedValue = normalizeMarkdown(value);
    if (normalizedValue === lastMarkdownRef.current) {
      return;
    }
    const rendered = renderMarkdownToHtml(normalizeMarkdown(value));
    setHtmlValue(rendered || EMPTY_HTML);
    lastMarkdownRef.current = normalizedValue;
  }, [value]);

  const handleChange = useCallback(
    (nextHtml: string) => {
      const normalized = normalizeHtml(nextHtml);
      setHtmlValue(normalized || EMPTY_HTML);
      const markdown = normalized
        ? normalizeMarkdown(turndown.turndown(normalized))
        : "";
      lastMarkdownRef.current = markdown;
      onChange(markdown, normalized);
    },
    [onChange, turndown]
  );

  const getActiveQuill = useCallback(() => {
    return quillRef.current?.getEditor?.();
  }, []);

  const fileToBase64 = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }, []);

  const sanitizeName = useCallback((name: string): string => {
    const parts = name.split(".");
    const ext = parts.pop()?.toLowerCase() ?? "";
    const base = parts.join(".") || "image";
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-{2,}/g, "-");
    const safeExt = allowedExtensions.has(ext) ? ext : "jpg";
    return `${safeBase}.${safeExt}`;
  }, []);

  const uploadImage = useCallback(
    async (file: File): Promise<string> => {
      if (!allowedImageTypes.has(file.type)) {
        throw new Error("Formats supportés : PNG, JPEG.");
      }

      const base64 = await fileToBase64(file);
      const safeName = sanitizeName(file.name);
      const response = await fetch("/api/supabase/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          slug: articleSlug,
          fileName: safeName,
          fileType: file.type,
          data: base64,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Téléversement impossible.");
      }

      return payload.publicUrl as string;
    },
    [articleId, articleSlug, fileToBase64, sanitizeName]
  );

  const handleImageInsert = useCallback(async () => {
    if (readOnly) return;
    const quill = getActiveQuill();
    if (!quill) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,image/png,image/jpeg";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file);
        const range = quill.getSelection(true);
        const insertIndex = range ? range.index : quill.getLength();
        quill.insertEmbed(insertIndex, "image", url, "user");
        quill.setSelection(insertIndex + 1, 0, "silent");
      } catch (error) {
        console.error("Image upload failed", error);
        alert(
          error instanceof Error
            ? error.message
            : "Impossible de téléverser cette image."
        );
      }
    };

    input.click();
  }, [getActiveQuill, readOnly, uploadImage]);

  useEffect(() => {
    const quill = getActiveQuill();
    if (!quill || readOnly) return;
    const toolbar = quill.getModule("toolbar");
    if (toolbar) {
      toolbar.addHandler("image", handleImageInsert);
    }
  }, [getActiveQuill, handleImageInsert, readOnly]);

  return (
    <div className="supabase-rich-text">
      <ReactQuill
        theme="snow"
        ref={quillRef}
        value={htmlValue}
        onChange={handleChange}
        readOnly={readOnly}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SupabaseRichTextEditor;
