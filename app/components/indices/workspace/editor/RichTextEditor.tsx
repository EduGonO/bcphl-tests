import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import { marked } from "marked";

const SimpleEditorClient = dynamic(
  () =>
    import("../../../tiptap-templates/simple/SimpleEditor").then(
      (m) => m.SimpleEditor
    ),
  { ssr: false }
);

export type RichTextEditorMode = "tiptap";

type Props = {
  value: string;
  htmlValue?: string;
  onChange: (markdown: string, html: string, json?: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  mode?: RichTextEditorMode;
  imageUploadSlug?: string;
};

/**
 * Normalize markdown line endings without touching non-ASCII characters.
 * Only normalises \r\n → \n and literal backslash-n sequences left by
 * double-stringification; does NOT touch unicode code points.
 */
const normalizeMarkdown = (markdown: string): string =>
  markdown
    .replace(/\r\n?/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\(?=\n)/g, "");

/**
 * Convert markdown → HTML for seeding the Tiptap editor.
 * marked is called with breaks:true so single newlines become <br>.
 * The result is a UTF-8 HTML string — accented characters are preserved as-is.
 */
const markdownToHtml = (markdown: string): string => {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized.trim()) return "";
  // marked.parse returns string synchronously when async is not set
  return (marked.parse(normalized, { breaks: true }) as string) ?? "";
};

const RichTextEditor: React.FC<Props> = ({
  value,
  htmlValue,
  onChange,
  placeholder,
  readOnly,
  imageUploadSlug,
}) => {
  const turndown = useMemo(() => {
    const td = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    // Preserve non-ASCII characters (accents, etc.) as literal UTF-8 rather
    // than escaping them as HTML entities or unicode sequences.
    td.addRule("preserveUnicode", {
      filter: () => false,
      replacement: (content) => content,
    });
    return td;
  }, []);

  /**
   * Seed value for the editor:
   * - Prefer htmlValue when it exists (already UTF-8 HTML from Supabase).
   * - Fall back to converting markdown only when htmlValue is absent/empty.
   */
  const seedHtml = htmlValue && htmlValue.trim() ? htmlValue : markdownToHtml(value);

  return (
    <SimpleEditorClient
      value={seedHtml}
      onChange={(html: string, json: any) => {
        const markdown = html.trim() ? normalizeMarkdown(turndown.turndown(html)) : "";
        onChange(markdown, html, json);
      }}
      placeholder={placeholder}
      readOnly={readOnly}
      imageUploadSlug={imageUploadSlug}
    />
  );
};

export default RichTextEditor;
