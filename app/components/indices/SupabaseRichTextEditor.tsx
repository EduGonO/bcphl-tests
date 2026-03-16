import dynamic from "next/dynamic";
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TurndownService from "turndown";
import { marked } from "marked";

import "react-quill/dist/quill.snow.css";

type ManifestImage = {
  key: string;
  url: string;
  filename: string;
  uploadedAt: string;
  isUsed: boolean;
};

type SupabaseRichTextEditorProps = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  slug?: string;
};

const ReactQuillBase = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="supabase-rich-text__loading">Chargement de l’éditeur…</div>,
}) as React.ComponentType<Record<string, unknown>>;

const ReactQuill = forwardRef<unknown, Record<string, unknown>>((props, ref) => (
  <ReactQuillBase {...props} ref={ref} />
));
ReactQuill.displayName = "ReactQuillForwardRef";

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

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") resolve(reader.result);
    else reject(new Error("Invalid file data"));
  };
  reader.onerror = () => reject(new Error("Unable to read file"));
  reader.readAsDataURL(file);
});

const SupabaseRichTextEditor: React.FC<SupabaseRichTextEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder,
  slug,
}) => {
  const [images, setImages] = useState<ManifestImage[]>([]);
  const [imagesStatus, setImagesStatus] = useState<"idle" | "loading" | "error">("idle");
  const [imagesError, setImagesError] = useState<string | null>(null);
  const quillRef = useRef<{ getEditor: () => any } | null>(null);

  const loadImages = useCallback(async () => {
    if (!slug) {
      setImages([]);
      return;
    }

    setImagesStatus("loading");
    setImagesError(null);
    try {
      const response = await fetch(`/api/images?slug=${encodeURIComponent(slug)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Erreur lors du chargement des images");
      }
      setImages(Array.isArray(payload) ? payload : []);
      setImagesStatus("idle");
    } catch (error) {
      setImagesStatus("error");
      setImagesError(error instanceof Error ? error.message : "Erreur inconnue");
    }
  }, [slug]);

  useEffect(() => {
    loadImages().catch(() => {
      /* noop */
    });
  }, [loadImages]);

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

  const markImageAsUsed = useCallback(async (key: string) => {
    if (!slug) return;

    try {
      await fetch("/api/images", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, key }),
      });
      setImages((prev) => prev.map((item) => (item.key === key ? { ...item, isUsed: true } : item)));
    } catch {
      // best effort; insertion should not be blocked by metadata update
    }
  }, [slug]);

  const insertImage = useCallback((url: string, key: string) => {
    const editor = quillRef.current?.getEditor?.();
    if (!editor) return;

    const selection = editor.getSelection(true);
    const index = selection?.index ?? editor.getLength();
    editor.insertEmbed(index, "image", url, "user");
    editor.setSelection(index + 1, 0, "user");
    markImageAsUsed(key).catch(() => {
      /* noop */
    });
  }, [markImageAsUsed]);

  const handleToolbarImage = useCallback(async () => {
    if (readOnly) return;
    if (!slug) {
      setImagesError("Ajoutez un slug d’article avant d’envoyer des images.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const dataUrl = await fileToDataUrl(file);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            data: dataUrl,
            slug,
          }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Échec de l’upload");
        }

        const uploaded: ManifestImage = {
          key: payload.key,
          url: payload.url,
          filename: file.name,
          uploadedAt: new Date().toISOString(),
          isUsed: false,
        };
        setImages((prev) => [uploaded, ...prev]);
        insertImage(payload.url, payload.key);
      } catch (error) {
        setImagesError(error instanceof Error ? error.message : "Échec de l’upload");
      }
    };
  }, [insertImage, readOnly, slug]);

  const deleteImage = useCallback(async (key: string) => {
    if (!slug || readOnly) return;

    try {
      const response = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, key }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Suppression impossible");
      }
      setImages((prev) => prev.filter((item) => item.key !== key));
    } catch (error) {
      setImagesError(error instanceof Error ? error.message : "Suppression impossible");
    }
  }, [readOnly, slug]);

  const modules = useMemo(() => ({
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
        image: handleToolbarImage,
      },
    },
  }), [handleToolbarImage]);

  return (
    <div className="supabase-rich-text">
      <ReactQuill
        theme="snow"
        value={htmlValue}
        onChange={handleChange}
        readOnly={readOnly}
        modules={modules}
        formats={quillFormats}
        placeholder={placeholder}
        ref={(instance) => {
          quillRef.current = instance as { getEditor: () => any } | null;
        }}
      />

      {slug ? (
        <aside className="supabase-image-drawer">
          <div className="supabase-image-drawer__header">
            <h4>Images de l’article</h4>
            <button type="button" onClick={() => loadImages()} disabled={imagesStatus === "loading"}>
              {imagesStatus === "loading" ? "Chargement…" : "Actualiser"}
            </button>
          </div>

          {imagesError && <p className="supabase-image-drawer__error">{imagesError}</p>}

          <div className="supabase-image-drawer__grid">
            {images.map((image) => (
              <div key={image.key} className="supabase-image-drawer__card">
                <img src={image.url} alt={image.filename} className="supabase-image-drawer__thumb" />
                <div className="supabase-image-drawer__meta">
                  <span title={image.filename}>{image.filename}</span>
                  <small>{image.isUsed ? "Utilisée" : "Non utilisée"}</small>
                </div>
                <div className="supabase-image-drawer__actions">
                  <button type="button" onClick={() => insertImage(image.url, image.key)} disabled={readOnly}>
                    Insert
                  </button>
                  <button type="button" onClick={() => deleteImage(image.key)} disabled={readOnly}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!images.length && <p className="supabase-image-drawer__empty">Aucune image pour ce slug.</p>}
          </div>
        </aside>
      ) : null}
    </div>
  );
};

export default SupabaseRichTextEditor;
