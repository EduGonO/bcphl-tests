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
import type ReactQuill from "react-quill";
import type { ReactQuillProps } from "react-quill";

import "react-quill/dist/quill.snow.css";

type SupabaseRichTextEditorProps = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
};

// Wrap the dynamic import in forwardRef so TypeScript accepts a ref prop.
const ForwardedQuill = dynamic(
  () =>
    import("react-quill").then((mod) => {
      const Quill = mod.default;
      const WithRef = forwardRef<ReactQuill, ReactQuillProps>((props, ref) => (
        <Quill {...props} ref={ref} />
      ));
      WithRef.displayName = "ReactQuillWithRef";
      return WithRef;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="supabase-rich-text__loading">
        Chargement de l&apos;éditeur&hellip;
      </div>
    ),
  }
) as React.ForwardRefExoticComponent<
  ReactQuillProps & React.RefAttributes<ReactQuill>
>;

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
  "blockquote",
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

const SupabaseRichTextEditor: React.FC<SupabaseRichTextEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder,
}) => {
  const quillRef = useRef<ReactQuill | null>(null);

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

  const imageHandler = useCallback(() => {
    alert("Starting upload...");

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;

      // Resolve the underlying Quill editor instance.
      // quillRef.current may be the ReactQuill wrapper (which has getEditor())
      // or, when forwardRef indirection is involved, the inner instance exposes
      // the editor directly via the .editor property.
      const raw = quillRef.current as any;
      const quill = raw?.getEditor?.() ?? raw?.editor ?? null;

      alert("Editor instance: " + !!quill);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              type: file.type,
              data: base64,
            }),
          });

          const json = await response.json();
          alert("Upload response: " + JSON.stringify(json));

          if (!response.ok || !json.url) {
            throw new Error(json.error ?? "Upload failed");
          }

          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", json.url);
            quill.setSelection(range.index + 1, 0);
          }
        } catch (err) {
          console.error("Image upload error:", err);
          alert(err instanceof Error ? err.message : "Image upload failed.");
        }
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, []);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote"],
          ["link", "image"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  return (
    <div className="supabase-rich-text">
      <ForwardedQuill
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
