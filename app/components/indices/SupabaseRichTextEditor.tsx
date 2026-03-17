import dynamic from "next/dynamic";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import TurndownService from "turndown";
import { marked } from "marked";

import "react-quill/dist/quill.snow.css";

type SupabaseRichTextEditorProps = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  slug?: string;
};

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="supabase-rich-text__loading">Chargement de l’éditeur…</div>,
});


const QuillEditor = ReactQuill as any;
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

const SupabaseRichTextEditor = forwardRef<any, SupabaseRichTextEditorProps>(function SupabaseRichTextEditor(
  { value, onChange, readOnly = false, placeholder, slug },
  ref
) {
  const quillRef = useRef<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useImperativeHandle(ref, () => quillRef.current);

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
    const rendered = renderMarkdownToHtml(normalizedValue);
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

  const insertImage = useCallback((url: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertEmbed(index, "image", url);
    editor.setSelection(index + 1, 0);
  }, []);

  const fetchImages = useCallback(async () => {
    if (!slug) return;
    const response = await fetch(`/api/images?slug=${encodeURIComponent(slug)}`);
    const urls = await response.json();
    setImages(Array.isArray(urls) ? urls : []);
  }, [slug]);

  const openPicker = useCallback(() => {
    if (!slug) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const data = String(reader.result || "");
        const response = await fetch("/api/images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, name: file.name, data }),
        });
        const payload = await response.json();
        if (payload.url) {
          insertImage(payload.url);
          fetchImages();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [fetchImages, insertImage, slug]);

  const modules = useMemo(
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
          image: openPicker,
        },
      },
    }),
    [openPicker]
  );

  useEffect(() => {
    if (drawerOpen) {
      fetchImages();
    }
  }, [drawerOpen, fetchImages]);

  return (
    <div className="supabase-rich-text">
      <div className="supabase-rich-text__toolbar">
        <button type="button" onClick={() => setDrawerOpen((state) => !state)}>
          Images
        </button>
      </div>

      <QuillEditor
        ref={quillRef}
        theme="snow"
        value={htmlValue}
        onChange={handleChange}
        readOnly={readOnly}
        modules={modules}
        formats={[
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
        ]}
        placeholder={placeholder}
      />

      {drawerOpen ? (
        <div className="supabase-rich-text__drawer">
          {images.map((url) => (
            <button key={url} type="button" onClick={() => insertImage(url)}>
              {url}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
});

export default SupabaseRichTextEditor;
