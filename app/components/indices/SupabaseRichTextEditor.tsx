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
  slug?: string;
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
  slug,
  readOnly = false,
  placeholder,
}) => {
  // quillRef holds the ReactQuill wrapper element (for the ref prop).
  const quillRef = useRef<ReactQuill | null>(null);
  // quillInstanceRef holds the raw underlying Quill editor instance.
  const quillInstanceRef = useRef<any>(null);

  const [images, setImages] = useState<{ key: string; url: string }[]>([]);

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

  // Ref callback: captures both the ReactQuill wrapper and the raw Quill instance.
  const setQuillRef = useCallback((el: ReactQuill | null) => {
    (quillRef as React.MutableRefObject<ReactQuill | null>).current = el;
    if (el) {
      const raw = el as any;
      quillInstanceRef.current =
        raw.getEditor?.() ??
        raw.editor ??
        raw.quill ??
        raw.__quill ??
        null;
    } else {
      quillInstanceRef.current = null;
    }
  }, []);

  const fetchImages = useCallback(async () => {
    if (!slug) return;
    const res = await fetch(`/api/images?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    setImages(data.images ?? []);
  }, [slug]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const imageHandler = useCallback(() => {
    alert("v4: starting upload...");

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return;

      // Use the raw Quill instance captured at mount time.
      const quill = quillInstanceRef.current;
      alert("v4: editor instance: " + !!quill);

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
              slug: slug ?? "",
            }),
          });

          const json = await response.json();
          alert("v4: upload response: " + JSON.stringify(json));

          if (!response.ok || !json.url) {
            throw new Error(json.error ?? "Upload failed");
          }

          if (quill) {
            const range =
              quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
            quill.insertEmbed(range.index, "image", json.url);
            quill.setSelection(range.index + 1, 0);
          }

          fetchImages();
        } catch (err) {
          console.error("Image upload error:", err);
          alert(err instanceof Error ? err.message : "Image upload failed.");
        }
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, [slug, fetchImages]);

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
        ref={setQuillRef}
        value={htmlValue}
        onChange={handleChange}
        readOnly={readOnly}
        modules={quillModules}
        formats={quillFormats}
        placeholder={placeholder}
      />
      {images.length > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            background: "#f9fafb",
          }}
        >
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
            Article Images
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {images.map((img) => (
              <div
                key={img.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <img
                  src={img.url}
                  alt={img.key}
                  style={{
                    width: 80,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #d1d5db",
                  }}
                />
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const quill = quillInstanceRef.current;
                      if (!quill) return;
                      const range =
                        quill.getSelection(true) ??
                        { index: quill.getLength(), length: 0 };
                      quill.insertEmbed(range.index, "image", img.url);
                    }}
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      await fetch("/api/images", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ key: img.key }),
                      });
                      fetchImages();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseRichTextEditor;
