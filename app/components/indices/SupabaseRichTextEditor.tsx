import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TurndownService from "turndown";
import { marked } from "marked";

import "react-quill/dist/quill.snow.css";

type SupabaseRichTextEditorProps = {
  value: string;
  onChange: (markdown: string, html: string) => void;
  readOnly?: boolean;
  placeholder?: string;
};

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="supabase-rich-text__loading">Chargement de l’éditeur…</div>,
});

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

const renderMarkdownToHtml = (markdown: string): string => {
  if (!markdown || !markdown.trim()) {
    return "";
  }
  return marked.parse(markdown, { breaks: true }) as string;
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
  const turndown = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    service.keep(["sup", "sub"]);
    service.addRule("breaks", {
      filter: "br",
      replacement: () => "\\n",
    });
    return service;
  }, []);

  const [htmlValue, setHtmlValue] = useState<string>(() => renderMarkdownToHtml(value));
  const lastMarkdownRef = useRef(value);

  useEffect(() => {
    if (value === lastMarkdownRef.current) {
      return;
    }
    setHtmlValue(renderMarkdownToHtml(value));
    lastMarkdownRef.current = value;
  }, [value]);

  const handleChange = useCallback(
    (nextHtml: string) => {
      const normalized = normalizeHtml(nextHtml);
      setHtmlValue(normalized);
      const markdown = normalized ? turndown.turndown(normalized) : "";
      lastMarkdownRef.current = markdown;
      onChange(markdown, normalized);
    },
    [onChange, turndown]
  );

  return (
    <div className="supabase-rich-text">
      <ReactQuill
        theme="snow"
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
