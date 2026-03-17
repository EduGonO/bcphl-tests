import dynamic from "next/dynamic";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const ForwardedQuill = dynamic(
  () =>
    import("react-quill").then((mod) => {
      const Quill = mod.default;
      const Comp = forwardRef<ReactQuill, ReactQuillProps>((props, ref) => (
        <Quill {...props} ref={ref} />
      ));
      Comp.displayName = "ReactQuillWithRef";
      return Comp;
    }),
  { ssr: false, loading: () => <div className="supabase-rich-text__loading">Chargement de l&#39;éditeur…</div> }
) as React.ForwardRefExoticComponent<ReactQuillProps & React.RefAttributes<ReactQuill>>;

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
  if (!normalized.trim()) return "";
  return marked.parse(normalized, { breaks: true }) as string;
};

const normalizeHtml = (html: string): string => {
  if (!html || html === EMPTY_HTML) return "";
  return html;
};

const SupabaseRichTextEditor: React.FC<SupabaseRichTextEditorProps> = ({
  value,
  onChange,
  slug,
  readOnly = false,
  placeholder,
}) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const quillInstanceRef = useRef<any>(null);

  const [images, setImages] = useState<
    Array<{ key: string; url: string; filename: string; isUsed: boolean }>
  >([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const turndown = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    service.keep(["sup", "sub"]);
    service.addRule("breaks", { filter: "br", replacement: () => "\n" });
    return service;
  }, []);

  const initialMarkdown = useMemo(() => normalizeMarkdown(value), [value]);
  const [htmlValue, setHtmlValue] = useState<string>(
    () => renderMarkdownToHtml(initialMarkdown) || EMPTY_HTML
  );
  const lastMarkdownRef = useRef(initialMarkdown);

  useEffect(() => {
    const normalizedValue = normalizeMarkdown(value);
    if (normalizedValue === lastMarkdownRef.current) return;
    const rendered = renderMarkdownToHtml(normalizeMarkdown(value));
    setHtmlValue(rendered || EMPTY_HTML);
    lastMarkdownRef.current = normalizedValue;
  }, [value]);

  const handleChange = useCallback(
    (nextHtml: string) => {
      const normalized = normalizeHtml(nextHtml);
      setHtmlValue(normalized || EMPTY_HTML);
      const markdown = normalized ? normalizeMarkdown(turndown.turndown(normalized)) : "";
      lastMarkdownRef.current = markdown;
      onChange(markdown, normalized);
    },
    [onChange, turndown]
  );

  const setQuillRef = useCallback((el: ReactQuill | null) => {
    quillRef.current = el;
    quillInstanceRef.current = el ?? null;
  }, []);

  const getQuillEditor = useCallback(() => {
    const raw = quillInstanceRef.current as any;
    return raw?.getEditor?.() ?? raw?.editor ?? raw?.quill ?? null;
  }, []);

  const fetchImages = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/images?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {}
  }, [slug]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, type: file.type, data: base64, slug: slug ?? "" }),
          });
          const json = await res.json();
          if (!json.url) return;
          const quill = getQuillEditor();
          if (!quill) return;
          const range = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
          quill.insertEmbed(range.index, "image", json.url);
          quill.setSelection(range.index + 1, 0);
          if (json.key) {
            await fetch("/api/images", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key: json.key, slug: slug ?? "" }),
            });
          }
          fetchImages();
        } catch {}
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [slug, getQuillEditor, fetchImages]);

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
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler]
  );

  return (
    <>
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
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", userSelect: "none" }}>
        <button
          type="button"
          onClick={() => setDrawerOpen((o) => !o)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            fontSize: 12,
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {drawerOpen ? "\u25b2" : "\u25bc"} Images ({images.length})
        </button>
        {drawerOpen && (
          <div
            style={{
              maxHeight: 160,
              overflowY: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              paddingTop: 4,
            }}
          >
            {images.length === 0 ? (
              <span style={{ fontSize: 11, color: "#9ca3af" }}>No images yet.</span>
            ) : (
              images.map((img) => (
                <div
                  key={img.key}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
                >
                  <img
                    src={img.url}
                    alt={img.filename}
                    style={{
                      width: 72,
                      height: 54,
                      objectFit: "cover",
                      borderRadius: 3,
                      border: "1px solid #d1d5db",
                    }}
                  />
                  <div style={{ display: "flex", gap: 3 }}>
                    <button
                      type="button"
                      style={{
                        fontSize: 10,
                        padding: "1px 5px",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        const quill = getQuillEditor();
                        if (!quill) return;
                        const range =
                          quill.getSelection(true) ??
                          { index: quill.getLength(), length: 0 };
                        quill.insertEmbed(range.index, "image", img.url);
                        quill.setSelection(range.index + 1, 0);
                        await fetch("/api/images", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: img.key, slug: slug ?? "" }),
                        });
                        fetchImages();
                      }}
                    >
                      Insert
                    </button>
                    <button
                      type="button"
                      style={{
                        fontSize: 10,
                        padding: "1px 5px",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        await fetch("/api/images", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ key: img.key, slug: slug ?? "" }),
                        });
                        fetchImages();
                      }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SupabaseRichTextEditor;
